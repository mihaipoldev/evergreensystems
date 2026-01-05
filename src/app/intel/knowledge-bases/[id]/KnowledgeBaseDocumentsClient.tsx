"use client";

import { useState, useEffect } from "react";
import { DocumentList } from "@/features/rag/documents/components/DocumentList";
import { createClient } from "@/lib/supabase/client";
import type { RAGDocument } from "@/features/rag/documents/document-types";

type DocumentWithKB = RAGDocument & { knowledge_base_name?: string | null };

type KnowledgeBaseDocumentsClientProps = {
  initialDocuments: DocumentWithKB[];
  knowledgeBaseId: string;
  knowledgeBaseName: string;
};

export function KnowledgeBaseDocumentsClient({
  initialDocuments,
  knowledgeBaseId,
  knowledgeBaseName,
}: KnowledgeBaseDocumentsClientProps) {
  const [documents, setDocuments] = useState<DocumentWithKB[]>(initialDocuments);
  const [loading, setLoading] = useState(false);

  // Update documents when initialDocuments changes (from server refresh)
  useEffect(() => {
    setDocuments(initialDocuments);
  }, [initialDocuments]);

  // Set up Supabase real-time subscription for documents in this knowledge base
  useEffect(() => {
    const supabase = createClient();
    
    console.log('🔌 Setting up document subscription for KB:', knowledgeBaseId);
    
    const channel = supabase
      .channel(`rag_documents_kb_${knowledgeBaseId}_changes`, {
        config: {
          broadcast: { self: true },
        },
      })
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rag_documents',
          filter: `knowledge_base_id=eq.${knowledgeBaseId}`, // Only listen to documents in this KB
        },
        async (payload) => {
          console.log('📄 Document change detected for KB:', {
            kbId: knowledgeBaseId,
            eventType: payload.eventType,
            documentId: (payload.new as any)?.id || (payload.old as any)?.id,
            status: (payload.new as any)?.status,
            timestamp: new Date().toISOString(),
          });

          if (payload.eventType === 'INSERT' && payload.new) {
            const newDoc = payload.new as any;
            
            // Skip if already soft-deleted or not for this KB
            if (newDoc.deleted_at || newDoc.knowledge_base_id !== knowledgeBaseId) {
              console.log('⏭️ Skipping INSERT - document is deleted or wrong KB');
              return;
            }

            const newDocWithKB: DocumentWithKB = {
              ...newDoc,
              knowledge_base_name: knowledgeBaseName,
            };

            setDocuments((prev) => {
              const exists = prev.some((doc) => doc.id === newDoc.id);
              if (exists) {
                console.log('⚠️ Document already exists in list, skipping INSERT');
                return prev;
              }
              
              console.log('✅ Adding new document to list:', newDoc.id);
              // Add new document and sort by updated_at descending
              const updated = [newDocWithKB, ...prev];
              return updated.sort((a, b) => 
                new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
              );
            });
          } else if (payload.eventType === 'UPDATE' && payload.new) {
            const updatedDoc = payload.new as any;
            
            // Skip if not for this KB
            if (updatedDoc.knowledge_base_id !== knowledgeBaseId) {
              console.log('⏭️ Skipping UPDATE - document belongs to different KB');
              return;
            }
            
            console.log('🔄 Processing UPDATE for document:', updatedDoc.id, {
              oldStatus: payload.old?.status,
              newStatus: updatedDoc.status,
              oldChunkCount: payload.old?.chunk_count,
              newChunkCount: updatedDoc.chunk_count,
              deletedAt: updatedDoc.deleted_at,
            });
            
            setDocuments((prev) => {
              // If document is soft-deleted (deleted_at is set), remove it from the list
              if (updatedDoc.deleted_at) {
                console.log('🗑️ Removing deleted document from list:', updatedDoc.id);
                return prev.filter((doc) => doc.id !== updatedDoc.id);
              }
              
              const existingDoc = prev.find((doc) => doc.id === updatedDoc.id);
              
              if (!existingDoc) {
                // Document not in list and not deleted, add it
                console.log('➕ Document not in list, adding:', updatedDoc.id);
                const updatedDocWithKB: DocumentWithKB = {
                  ...updatedDoc,
                  knowledge_base_name: knowledgeBaseName,
                };
                const updatedList = [updatedDocWithKB, ...prev];
                return updatedList.sort((a, b) => 
                  new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
                );
              }
              
              // Update existing document, preserve knowledge_base_name
              console.log('✅ Updating existing document in list:', updatedDoc.id, {
                statusChanged: existingDoc.status !== updatedDoc.status,
                chunkCountChanged: existingDoc.chunk_count !== updatedDoc.chunk_count,
              });
              const updated = prev.map((doc) =>
                doc.id === updatedDoc.id
                  ? { ...updatedDoc, knowledge_base_name: knowledgeBaseName }
                  : doc
              );
              
              return updated;
            });
          } else if (payload.eventType === 'DELETE' && payload.old) {
            const deletedDoc = payload.old as any;
            
            // Skip if not for this KB
            if (deletedDoc.knowledge_base_id !== knowledgeBaseId) {
              return;
            }
            
            console.log('🗑️ Processing DELETE for document:', deletedDoc.id);
            setDocuments((prev) => {
              return prev.filter((doc) => doc.id !== deletedDoc.id);
            });
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Document subscription status for KB:', knowledgeBaseId, status);
        if (status === 'SUBSCRIBED') {
          console.log('✅ Successfully subscribed to document changes for KB:', knowledgeBaseId);
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Channel error - check Supabase real-time settings and ensure rag_documents table has Realtime enabled');
        } else if (status === 'TIMED_OUT') {
          console.error('❌ Subscription timed out - Realtime connection issue');
        } else if (status === 'CLOSED') {
          console.log('⚠️ Subscription closed');
        }
      });

    return () => {
      console.log('🧹 Cleaning up document subscription for KB:', knowledgeBaseId);
      supabase.removeChannel(channel);
    };
  }, [knowledgeBaseId, knowledgeBaseName]);

  return (
    <DocumentList
      initialDocuments={documents}
      knowledgeBaseId={knowledgeBaseId}
      knowledgeBaseName={knowledgeBaseName}
    />
  );
}


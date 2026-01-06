"use client";

import { useState, useEffect } from "react";
import { DocumentList } from "@/features/rag/documents/components/DocumentList";
import { createClient } from "@/lib/supabase/client";
import type { RAGDocument } from "@/features/rag/documents/document-types";

type DocumentWithKB = RAGDocument & { 
  knowledge_base_name?: string | null;
};

type ResearchDocumentsClientProps = {
  initialDocuments: DocumentWithKB[];
  researchSubjectId: string;
  researchSubjectName: string;
  researchSubjectType: string | null;
};

export function ResearchDocumentsClient({
  initialDocuments,
  researchSubjectId,
  researchSubjectName,
  researchSubjectType,
}: ResearchDocumentsClientProps) {
  const [documents, setDocuments] = useState<DocumentWithKB[]>(initialDocuments);
  const [loading, setLoading] = useState(false);

  // Update documents when initialDocuments changes (from server refresh)
  useEffect(() => {
    setDocuments(initialDocuments);
  }, [initialDocuments]);

  // Set up Supabase real-time subscription for research documents junction table
  useEffect(() => {
    const supabase = createClient();
    
    console.log('🔌 Setting up document subscription for research subject:', researchSubjectId);
    
    // Channel for research_documents junction table (linked documents)
    const junctionChannel = supabase
      .channel(`research_documents_junction_${researchSubjectId}`, {
        config: {
          broadcast: { self: true },
        },
      })
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'research_documents',
          filter: `research_subject_id=eq.${researchSubjectId}`,
        },
        async (payload) => {
          console.log('🔗 Research document link change detected:', {
            researchSubjectId,
            eventType: payload.eventType,
            documentId: (payload.new as any)?.document_id || (payload.old as any)?.document_id,
          });

          if (payload.eventType === 'INSERT' && payload.new) {
            const newLink = payload.new as any;
            const documentId = newLink.document_id;
            
            // Fetch the document with its knowledge base
            const { data: docData } = await supabase
              .from('rag_documents')
              .select(`
                *,
                rag_knowledge_bases (name)
              `)
              .eq('id', documentId)
              .is('deleted_at', null)
              .single();
            
            if (docData) {
              const kbName = (docData as any).rag_knowledge_bases?.name || null;
              const newDocWithKB: DocumentWithKB = {
                ...(docData as any),
                knowledge_base_name: kbName || researchSubjectName,
              };

              setDocuments((prev) => {
                const exists = prev.some((doc) => doc.id === documentId);
                if (exists) {
                  return prev;
                }
                
                const updated = [newDocWithKB, ...prev];
                return updated.sort((a, b) => 
                  new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                );
              });
            }
          } else if (payload.eventType === 'DELETE' && payload.old) {
            const deletedLink = payload.old as any;
            const documentId = deletedLink.document_id;
            
            // Remove the document from the list
            setDocuments((prev) => {
              return prev.filter((doc) => doc.id !== documentId);
            });
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Research documents junction subscription status:', researchSubjectId, status);
      });

    // Also subscribe to rag_documents changes to handle updates/deletes
    const documentsChannel = supabase
      .channel(`rag_documents_research_${researchSubjectId}`, {
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
        },
        async (payload) => {
          console.log('📄 Document change detected for research subject:', {
            researchSubjectId,
            eventType: payload.eventType,
            documentId: (payload.new as any)?.id || (payload.old as any)?.id,
          });

          if (payload.eventType === 'UPDATE' && payload.new) {
            const updatedDoc = payload.new as any;
            
            // Check if this document is linked to this research subject
            const { data: linkData } = await supabase
              .from('research_documents')
              .select('id')
              .eq('research_subject_id', researchSubjectId)
              .eq('document_id', updatedDoc.id)
              .single();
            
            if (linkData) {
              // This document is linked to this research subject
              setDocuments((prev) => {
                // If document is soft-deleted, remove it from the list
                if (updatedDoc.deleted_at) {
                  return prev.filter((doc) => doc.id !== updatedDoc.id);
                }
                
                // Fetch updated KB name
                supabase
                  .from('rag_knowledge_bases')
                  .select('name')
                  .eq('id', updatedDoc.knowledge_base_id)
                  .single()
                  .then(({ data: kbData }) => {
                    const kbName = (kbData as any)?.name || null;
                    setDocuments((prevList) => {
                      const existingDoc = prevList.find((doc) => doc.id === updatedDoc.id);
                      if (existingDoc) {
                        return prevList.map((doc) =>
                          doc.id === updatedDoc.id
                            ? { ...updatedDoc, knowledge_base_name: kbName || doc.knowledge_base_name }
                            : doc
                        );
                      }
                      return prevList;
                    });
                  });
                
                return prev;
              });
            }
          } else if (payload.eventType === 'DELETE' && payload.old) {
            const deletedDoc = payload.old as any;
            
            // Remove if it's in our list
            setDocuments((prev) => {
              return prev.filter((doc) => doc.id !== deletedDoc.id);
            });
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Documents subscription status for research subject:', researchSubjectId, status);
      });

    return () => {
      console.log('🧹 Cleaning up document subscriptions for research subject:', researchSubjectId);
      supabase.removeChannel(junctionChannel);
      supabase.removeChannel(documentsChannel);
    };
  }, [researchSubjectId, researchSubjectName, initialDocuments]);

  return (
    <DocumentList
      initialDocuments={documents}
      projectId={researchSubjectId}
      researchSubjectId={researchSubjectId}
      researchSubjectType={researchSubjectType}
    />
  );
}


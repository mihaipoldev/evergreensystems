"use client";

import { Suspense, useState, useEffect } from "react";
import { DocumentList } from "@/features/rag/documents/components/DocumentList";
import type { RAGDocument } from "@/features/rag/documents/document-types";
import { createClient } from "@/lib/supabase/client";

type DocumentWithKB = RAGDocument & { knowledge_base_name?: string | null };

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentWithKB[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/intel/documents");

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to fetch documents");
        }

        const data = await response.json();
        // Handle both response formats: array of documents or { documents: [...] }
        setDocuments(Array.isArray(data) ? data : (data.documents || []));
      } catch (err) {
        console.error("Error fetching documents:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Set up Supabase real-time subscription for documents
  useEffect(() => {
    const supabase = createClient();
    
    console.log('🔌 Setting up document subscription...');
    
    const channel = supabase
      .channel('rag_documents_changes', {
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
          console.log('📄 Document change detected:', {
            eventType: payload.eventType,
            documentId: (payload.new as any)?.id || (payload.old as any)?.id,
            status: (payload.new as any)?.status,
            timestamp: new Date().toISOString(),
          });

          if (payload.eventType === 'INSERT' && payload.new) {
            const newDoc = payload.new as any;
            
            // Skip if already soft-deleted
            if (newDoc.deleted_at) {
              console.log('⏭️ Skipping INSERT - document is deleted');
              return;
            }
            
            // Fetch knowledge base name for the new document
            const { data: kbData } = await (supabase
              .from("rag_knowledge_bases") as any)
              .select("name")
              .eq("id", newDoc.knowledge_base_id)
              .single();

            const newDocWithKB: DocumentWithKB = {
              ...newDoc,
              knowledge_base_name: (kbData as any)?.name || null,
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
                // Document not in list and not deleted, fetch KB name and add it
                console.log('➕ Document not in list, fetching KB name and adding:', updatedDoc.id);
                (supabase
                  .from("rag_knowledge_bases") as any)
                  .select("name")
                  .eq("id", updatedDoc.knowledge_base_id)
                  .single()
                  .then(({ data: kbData }: { data: any }) => {
                    const updatedDocWithKB: DocumentWithKB = {
                      ...updatedDoc,
                      knowledge_base_name: kbData?.name || null,
                    };
                    setDocuments((prevList) => {
                      // Check if it's still not in the list (avoid race conditions)
                      const stillNotExists = !prevList.some((doc) => doc.id === updatedDoc.id);
                      if (stillNotExists && !updatedDoc.deleted_at) {
                        console.log('✅ Adding new document to list via UPDATE:', updatedDoc.id);
                        const updatedList = [updatedDocWithKB, ...prevList];
                        return updatedList.sort((a, b) => 
                          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
                        );
                      }
                      return prevList;
                    });
                  })
                  .catch((err: any) => {
                    console.error('Error fetching KB name for document:', err);
                  });
                return prev;
              }
              
              // Update existing document, preserve knowledge_base_name
              console.log('✅ Updating existing document in list:', updatedDoc.id, {
                statusChanged: existingDoc.status !== updatedDoc.status,
                chunkCountChanged: existingDoc.chunk_count !== updatedDoc.chunk_count,
              });
              const updated = prev.map((doc) =>
                doc.id === updatedDoc.id
                  ? { ...updatedDoc, knowledge_base_name: doc.knowledge_base_name }
                  : doc
              );
              
              return updated;
            });
          } else if (payload.eventType === 'DELETE' && payload.old) {
            const deletedDoc = payload.old as { id: string };
            
            console.log('🗑️ Processing DELETE for document:', deletedDoc.id);
            setDocuments((prev) => {
              return prev.filter((doc) => doc.id !== deletedDoc.id);
            });
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Document subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('✅ Successfully subscribed to document changes');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Channel error - check Supabase real-time settings and ensure rag_documents table has Realtime enabled');
        } else if (status === 'TIMED_OUT') {
          console.error('❌ Subscription timed out - Realtime connection issue');
        } else if (status === 'CLOSED') {
          console.log('⚠️ Subscription closed');
        }
      });

    return () => {
      console.log('🧹 Cleaning up document subscription');
      supabase.removeChannel(channel);
    };
  }, []); // Run once on mount, don't depend on loading

  if (error) {
    return (
      <div className="w-full space-y-3">
        <div className="text-center py-12">
          <p className="text-destructive">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <DocumentList initialDocuments={documents} />
    </div>
  );
}


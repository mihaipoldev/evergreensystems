"use client";

import { useState, useEffect } from "react";
import { DocumentList } from "@/features/rag/documents/components/DocumentList";
import { createClient } from "@/lib/supabase/client";
import type { RAGDocument } from "@/features/rag/documents/document-types";

type DocumentWithKB = RAGDocument & { 
  knowledge_base_name?: string | null;
  is_workspace_document?: boolean;
};

type ProjectDocumentsClientProps = {
  initialDocuments: DocumentWithKB[];
  projectId: string;
  projectName: string;
  kbId: string;
  kbName?: string | null;
};

export function ProjectDocumentsClient({
  initialDocuments,
  projectId,
  projectName,
  kbId,
  kbName,
}: ProjectDocumentsClientProps) {
  const [documents, setDocuments] = useState<DocumentWithKB[]>(initialDocuments);
  const [loading, setLoading] = useState(false);

  // Update documents when initialDocuments changes (from server refresh)
  useEffect(() => {
    setDocuments(initialDocuments);
  }, [initialDocuments]);

  // Set up Supabase real-time subscriptions for project documents
  useEffect(() => {
    const supabase = createClient();
    
    console.log('🔌 Setting up document subscriptions for project:', projectId);
    
    // Track all document IDs that belong to this project
    const projectDocumentIds = new Set(initialDocuments.map(doc => doc.id));
    
    // Channel for workspace KB documents (documents in project's workspace KB)
    const workspaceChannel = supabase
      .channel(`rag_documents_project_workspace_${projectId}`, {
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
          filter: `knowledge_base_id=eq.${kbId}`, // Only listen to documents in workspace KB
        },
        async (payload) => {
          console.log('📄 Workspace document change detected for project:', {
            projectId,
            eventType: payload.eventType,
            documentId: (payload.new as any)?.id || (payload.old as any)?.id,
          });

          if (payload.eventType === 'INSERT' && payload.new) {
            const newDoc = payload.new as any;
            
            // Skip if already soft-deleted or not for this KB
            if (newDoc.deleted_at || newDoc.knowledge_base_id !== kbId) {
              return;
            }

            const newDocWithKB: DocumentWithKB = {
              ...newDoc,
              knowledge_base_name: kbName || projectName,
              is_workspace_document: true, // Workspace KB documents
            };

            setDocuments((prev) => {
              const exists = prev.some((doc) => doc.id === newDoc.id);
              if (exists) {
                return prev;
              }
              
              const updated = [newDocWithKB, ...prev];
              return updated.sort((a, b) => 
                new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
              );
            });
          } else if (payload.eventType === 'UPDATE' && payload.new) {
            const updatedDoc = payload.new as any;
            
            // Skip if not for this KB
            if (updatedDoc.knowledge_base_id !== kbId) {
              return;
            }
            
            setDocuments((prev) => {
              // If document is soft-deleted (deleted_at is set), remove it from the list
              if (updatedDoc.deleted_at) {
                return prev.filter((doc) => doc.id !== updatedDoc.id);
              }
              
              const existingDoc = prev.find((doc) => doc.id === updatedDoc.id);
              
              if (!existingDoc) {
                // Document not in list and not deleted, add it if it's in workspace KB
                const updatedDocWithKB: DocumentWithKB = {
                  ...updatedDoc,
                  knowledge_base_name: kbName || projectName,
                  is_workspace_document: true, // Workspace KB documents
                };
                const updatedList = [updatedDocWithKB, ...prev];
                return updatedList.sort((a, b) => 
                  new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
                );
              }
              
              // Update existing document (preserve is_workspace_document flag)
              const updated = prev.map((doc) =>
                doc.id === updatedDoc.id
                  ? { 
                      ...updatedDoc, 
                      knowledge_base_name: kbName || projectName,
                      is_workspace_document: doc.is_workspace_document ?? true, // Preserve existing flag or default to true for workspace
                    }
                  : doc
              );
              
              return updated;
            });
          } else if (payload.eventType === 'DELETE' && payload.old) {
            const deletedDoc = payload.old as any;
            
            // Skip if not for this KB
            if (deletedDoc.knowledge_base_id !== kbId) {
              return;
            }
            
            setDocuments((prev) => {
              return prev.filter((doc) => doc.id !== deletedDoc.id);
            });
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Workspace document subscription status for project:', projectId, status);
      });

    // Channel for project_documents junction table (linked research documents)
    const junctionChannel = supabase
      .channel(`project_documents_junction_${projectId}`, {
        config: {
          broadcast: { self: true },
        },
      })
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'project_documents',
          filter: `project_id=eq.${projectId}`,
        },
        async (payload) => {
          console.log('🔗 Project document link change detected:', {
            projectId,
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
                knowledge_base_name: kbName || projectName,
                is_workspace_document: false, // Linked documents
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
            
            // Only remove if it's not in the workspace KB (it's a linked document)
            setDocuments((prev) => {
              return prev.filter((doc) => {
                // Keep if it's in workspace KB, remove if it's only linked
                if (doc.knowledge_base_id === kbId) {
                  return true;
                }
                return doc.id !== documentId;
              });
            });
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Project documents junction subscription status:', projectId, status);
      });

    return () => {
      console.log('🧹 Cleaning up document subscriptions for project:', projectId);
      supabase.removeChannel(workspaceChannel);
      supabase.removeChannel(junctionChannel);
    };
  }, [projectId, projectName, kbId, kbName, initialDocuments]);

  return (
    <DocumentList
      initialDocuments={documents}
      knowledgeBaseId={kbId}
      knowledgeBaseName={kbName || projectName}
      projectId={projectId}
    />
  );
}

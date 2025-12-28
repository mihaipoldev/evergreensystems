"use client";

import { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import { AdminToolbar } from "@/components/admin/AdminToolbar";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { DocumentCard } from "./DocumentCard";
import { AddDocumentModal } from "./AddDocumentModal";
import { RemoveDocumentDialog } from "./RemoveDocumentDialog";
import { removeDocument } from "../document-api";
import { createClient } from "@/lib/supabase/client";
import type { RAGDocument } from "../document-types";

type DocumentsListProps = {
  knowledgeBaseId: string;
  initialDocuments: RAGDocument[];
};

export function DocumentsList({ knowledgeBaseId, initialDocuments }: DocumentsListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
  const [documentToRemove, setDocumentToRemove] = useState<RAGDocument | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);
  // Local state for optimistic updates
  const [documents, setDocuments] = useState<RAGDocument[]>(initialDocuments);

  // Update local state when initialDocuments changes (e.g., after refresh)
  useEffect(() => {
    setDocuments(initialDocuments);
  }, [initialDocuments]);

  // Polling fallback: Periodically check for document status updates
  // This ensures UI updates even if Realtime subscription fails
  useEffect(() => {
    // Only poll if we have documents in processing state
    const hasProcessingDocuments = documents.some(doc => doc.status === 'processing');
    if (!hasProcessingDocuments) {
      return;
    }

    const pollInterval = setInterval(async () => {
      try {
        const supabase = createClient();
        const { data: updatedDocuments, error } = await supabase
          .from('rag_documents')
          .select('*')
          .eq('knowledge_base_id', knowledgeBaseId)
          .is('deleted_at', null)
          .in('id', documents.filter(d => d.status === 'processing').map(d => d.id))
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error polling document updates:', error);
          return;
        }

        if (updatedDocuments && updatedDocuments.length > 0) {
          const typedUpdatedDocuments = updatedDocuments as RAGDocument[];
          setDocuments((prevDocuments) => {
            const updated = prevDocuments.map((doc) => {
              const updatedDoc = typedUpdatedDocuments.find((ud) => ud.id === doc.id);
              return updatedDoc ? { ...doc, ...updatedDoc } : doc;
            });
            
            // Log if we found status changes
            typedUpdatedDocuments.forEach((updatedDoc) => {
              const oldDoc = prevDocuments.find((d) => d.id === updatedDoc.id);
              if (oldDoc && oldDoc.status !== updatedDoc.status) {
                console.log('📊 Polling: Document status updated:', {
                  id: updatedDoc.id,
                  oldStatus: oldDoc.status,
                  newStatus: updatedDoc.status,
                });
              }
            });
            
            return updated;
          });
        }
      } catch (error) {
        console.error('Error in polling fallback:', error);
      }
    }, 3000); // Poll every 3 seconds

    return () => clearInterval(pollInterval);
  }, [documents, knowledgeBaseId]);

  // Set up Supabase real-time subscription for documents
  useEffect(() => {
    const supabase = createClient();
    
    const channel = supabase
      .channel(`rag_documents_${knowledgeBaseId}_changes`, {
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
          console.log('Document change detected (raw payload):', {
            eventType: payload.eventType,
            table: payload.table,
            schema: payload.schema,
            new: payload.new,
            old: payload.old,
          });

          // Filter events to only process changes for the current knowledge base
          const newDoc = payload.new as RAGDocument | null;
          const oldDoc = payload.old as RAGDocument | null;
          const documentKnowledgeBaseId = newDoc?.knowledge_base_id || oldDoc?.knowledge_base_id;
          
          console.log('Filtering by knowledge_base_id:', {
            documentKnowledgeBaseId,
            currentKnowledgeBaseId: knowledgeBaseId,
            matches: documentKnowledgeBaseId === knowledgeBaseId,
          });
          
          if (documentKnowledgeBaseId !== knowledgeBaseId) {
            console.log('Event filtered out - different knowledge base');
            return;
          }

          if (payload.eventType === 'INSERT' && payload.new) {
            const newDocument = payload.new as RAGDocument;
            
            // Skip if document is soft-deleted
            if (newDocument.deleted_at) {
              console.log('Skipping INSERT - document is soft-deleted');
              return;
            }

            // Prevent duplicates (in case document was optimistically added)
            setDocuments((prevDocuments) => {
              const exists = prevDocuments.some((doc) => doc.id === newDocument.id);
              if (exists) {
                console.log('Skipping INSERT - document already exists in state');
                return prevDocuments;
              }
              
              // Add new document and sort by created_at descending
              const updated = [...prevDocuments, newDocument];
              console.log('Document inserted from subscription:', newDocument);
              return updated.sort((a, b) => 
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
              );
            });
          } else if (payload.eventType === 'UPDATE' && payload.new) {
            const updatedDocument = payload.new as RAGDocument;
            
            console.log('Processing UPDATE event:', {
              id: updatedDocument.id,
              status: updatedDocument.status,
              deleted_at: updatedDocument.deleted_at,
            });
            
            // If document was soft-deleted, remove it from the list
            if (updatedDocument.deleted_at) {
              setDocuments((prevDocuments) => {
                const filtered = prevDocuments.filter((doc) => doc.id !== updatedDocument.id);
                console.log('Document soft-deleted from subscription:', updatedDocument.id);
                return filtered;
              });
              return;
            }

            // Update existing document in state
            setDocuments((prevDocuments) => {
              const exists = prevDocuments.some((doc) => doc.id === updatedDocument.id);
              if (!exists) {
                // Document not in list, add it (in case it was filtered out before)
                const updated = [...prevDocuments, updatedDocument];
                console.log('Document not in state, adding from UPDATE event:', updatedDocument);
                return updated.sort((a, b) => 
                  new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                );
              }
              
              // Merge updated fields with existing document
              const updated = prevDocuments.map((doc) =>
                doc.id === updatedDocument.id
                  ? { ...doc, ...updatedDocument }
                  : doc
              );
              
              console.log('Document updated from subscription:', {
                id: updatedDocument.id,
                oldStatus: prevDocuments.find(d => d.id === updatedDocument.id)?.status,
                newStatus: updatedDocument.status,
                fullDocument: updatedDocument,
              });
              
              return updated;
            });
          } else if (payload.eventType === 'DELETE' && payload.old) {
            const deletedDocument = payload.old as { id: string };
            
            // Remove deleted document from state
            setDocuments((prevDocuments) => {
              const filtered = prevDocuments.filter((doc) => doc.id !== deletedDocument.id);
              console.log('Document deleted from subscription:', deletedDocument.id);
              return filtered;
            });
          } else {
            console.warn('Unhandled event type or missing data:', {
              eventType: payload.eventType,
              hasNew: !!payload.new,
              hasOld: !!payload.old,
            });
          }
        }
      )
      .subscribe((status) => {
        console.log('Document subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('✅ Successfully subscribed to document changes for knowledge base:', knowledgeBaseId);
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Channel error - check Supabase real-time settings and ensure rag_documents table has Realtime enabled');
        } else if (status === 'TIMED_OUT') {
          console.error('❌ Subscription timed out - Realtime connection issue');
        } else if (status === 'CLOSED') {
          console.log('⚠️ Subscription closed');
        }
      });

    return () => {
      console.log('Cleaning up document subscription');
      supabase.removeChannel(channel);
    };
  }, [knowledgeBaseId]);

  const filteredDocuments = useMemo(() => {
    if (!searchQuery.trim()) {
      return documents;
    }

    const query = searchQuery.toLowerCase();
    return documents.filter((doc) => {
      const titleMatch = doc.title?.toLowerCase().includes(query);
      const contentMatch = doc.content?.toLowerCase().includes(query);
      return titleMatch || contentMatch;
    });
  }, [documents, searchQuery]);

  const handleRemoveClick = async (documentId: string): Promise<void> => {
    const doc = documents.find((d) => d.id === documentId);
    if (!doc) return;

    // Capture document info for potential restoration
    const documentToRemoveCopy = doc;

    // Optimistic update: immediately remove from UI
    setDocuments((prev) => prev.filter((d) => d.id !== documentId));
    
    // Show success toast immediately
    toast.success("Document removed successfully");

    // Then call the API
    setIsRemoving(true);
    try {
      const result = await removeDocument({
        knowledge_base_id: knowledgeBaseId,
        document_id: documentId,
      });

      if (!result.success) {
        throw new Error(result.error || "Failed to remove document");
      }

      // Realtime subscription will handle UI updates automatically
    } catch (error: any) {
      console.error("Error removing document:", error);
      // Restore the document on error
      setDocuments((prev) => {
        const restored = [...prev, documentToRemoveCopy];
        return restored.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      });
      toast.error(error.message || "Failed to remove document");
      throw error; // Re-throw so ActionMenu can handle it
    } finally {
      setIsRemoving(false);
    }
  };

  const handleRemoveConfirm = async () => {
    if (!documentToRemove) return;

    // Capture document info before clearing state
    const documentToRemoveCopy = documentToRemove;
    const documentIdToRemove = documentToRemove.id;

    // Optimistic update: immediately remove from UI
    setDocuments((prev) => prev.filter((doc) => doc.id !== documentIdToRemove));
    
    // Close dialog and show success toast immediately
    setIsRemoveDialogOpen(false);
    setDocumentToRemove(null);
    toast.success("Document removed successfully");

    // Then call the API
    setIsRemoving(true);
    try {
      const result = await removeDocument({
        knowledge_base_id: knowledgeBaseId,
        document_id: documentIdToRemove,
      });

      if (!result.success) {
        throw new Error(result.error || "Failed to remove document");
      }

      // Realtime subscription will handle UI updates automatically
    } catch (error: any) {
      console.error("Error removing document:", error);
      // Restore the document on error
      setDocuments((prev) => {
        const restored = [...prev, documentToRemoveCopy];
        return restored.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      });
      toast.error(error.message || "Failed to remove document");
    } finally {
      setIsRemoving(false);
    }
  };

  const handleAddSuccess = (newDocument: RAGDocument) => {
    // Optimistically add the document to state immediately
    // This ensures the UI updates right away, especially when going from empty to first document
    setDocuments((prevDocuments) => {
      // Prevent duplicates (Realtime subscription may also add it)
      const exists = prevDocuments.some((doc) => doc.id === newDocument.id);
      if (exists) {
        return prevDocuments;
      }
      
      // Add new document and sort by created_at descending
      const updated = [...prevDocuments, newDocument];
      return updated.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    });
    
    // Realtime subscription will handle any subsequent updates (e.g., status changes)
  };

  return (
    <div className="w-full space-y-6">
      <div className="space-y-3 md:space-y-4">
        <AdminToolbar
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search documents..."
        >
          <Button
            onClick={() => setIsAddModalOpen(true)}
            variant="ghost"
            className="rounded-full w-10 h-10 p-0 bg-transparent text-muted-foreground hover:text-primary hover:bg-transparent border-0 shadow-none transition-colors"
            title="Add Document"
          >
            <FontAwesomeIcon icon={faPlus} className="h-5 w-5" />
          </Button>
        </AdminToolbar>

        {filteredDocuments.length === 0 && documents.length === 0 ? (
          <div className="rounded-xl bg-card/50 border border-border/40 p-12 py-16 text-center">
            <div className="max-w-md mx-auto space-y-4">
              <div className="h-20 w-20 rounded-full flex items-center justify-center bg-primary/10 mx-auto">
                <FontAwesomeIcon icon={faPlus} className="h-10 w-10 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Add your first document
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Upload a file or paste text content to start building your knowledge base
                </p>
                <Button onClick={() => setIsAddModalOpen(true)}>
                  <FontAwesomeIcon icon={faPlus} className="h-4 w-4 mr-2" />
                  Add Document
                </Button>
              </div>
            </div>
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/60 bg-muted/30 p-8 text-center text-muted-foreground">
            No documents found matching your search
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDocuments.map((document) => (
              <DocumentCard
                key={document.id}
                document={document}
                onRemove={handleRemoveClick}
              />
            ))}
          </div>
        )}
      </div>

      <AddDocumentModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        knowledgeBaseId={knowledgeBaseId}
        onSuccess={handleAddSuccess}
      />

      <RemoveDocumentDialog
        open={isRemoveDialogOpen}
        onOpenChange={setIsRemoveDialogOpen}
        document={documentToRemove}
        onConfirm={handleRemoveConfirm}
      />
    </div>
  );
}


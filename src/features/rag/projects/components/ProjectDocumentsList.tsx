"use client";

import { useState, useMemo } from "react";
import { AdminToolbar } from "@/components/admin/ui/AdminToolbar";
import { DocumentCard } from "@/features/rag/documents/components/DocumentCard";
import type { RAGDocument } from "@/features/rag/documents/document-types";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

type ProjectDocumentsListProps = {
  projectId: string;
  initialDocuments: RAGDocument[];
};

export function ProjectDocumentsList({ projectId, initialDocuments }: ProjectDocumentsListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [documents, setDocuments] = useState<RAGDocument[]>(initialDocuments);

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

  const handleRemove = async (documentId: string): Promise<void> => {
    try {
      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      // Check if document is linked via junction table (research documents)
      const { data: junctionData } = await supabase
        .from("project_documents")
        .select("*")
        .eq("project_id", projectId)
        .eq("document_id", documentId)
        .maybeSingle();

      if (junctionData) {
        // Remove from junction table via API
        const response = await fetch(`/api/intel/projects/${projectId}/link-documents`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          },
          body: JSON.stringify({ document_ids: [documentId] }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to unlink document");
        }
      } else {
        // Document is in workspace KB - delete it
        const { error } = await supabase
          .from("rag_documents")
          .delete()
          .eq("id", documentId);

        if (error) {
          throw error;
        }
      }

      setDocuments((prev) => prev.filter((doc) => doc.id !== documentId));
      toast.success("Document removed from project");
    } catch (error: any) {
      console.error("Error removing document:", error);
      toast.error(error.message || "Failed to remove document");
      throw error;
    }
  };

  const handleCopy = (doc: RAGDocument) => {
    const text = doc.content || "";
    if (!text) {
      toast.error("No content to copy");
      return;
    }
    navigator.clipboard.writeText(text).then(
      () => toast.success("Document copied to clipboard"),
      () => toast.error("Failed to copy to clipboard")
    );
  };

  return (
    <div className="w-full space-y-6">
      <div className="space-y-3 md:space-y-4">
        <AdminToolbar
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search documents..."
        />

        {filteredDocuments.length === 0 && documents.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/60 bg-muted/30 p-8 text-center text-muted-foreground">
            No documents linked to this project yet
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/60 bg-muted/30 p-8 text-center text-muted-foreground">
            No documents found matching your search
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDocuments.map((document) => (
              <div key={document.id} className="group transform transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1">
                <DocumentCard
                  document={document}
                  onCopy={() => handleCopy(document)}
                  onDelete={() => handleRemove(document.id)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


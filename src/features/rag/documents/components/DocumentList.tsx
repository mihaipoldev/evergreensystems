"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { Toolbar, type ViewMode } from "@/features/rag/shared/components/Toolbar";
import { useViewMode } from "@/features/rag/shared/hooks/useViewMode";
import type { FilterCategory } from "@/features/rag/shared/components/RAGFilterMenu";
import { DocumentGrid } from "./DocumentGrid";
import { DocumentTable } from "./DocumentTable";
import { DocumentModal } from "./DocumentModal";
import { RemoveDocumentDialog } from "./RemoveDocumentDialog";
import { MarkdownContentModal } from "./MarkdownContentModal";
import { removeDocument, getDocumentUrl, downloadDocument } from "../document-api";
import type { RAGDocument } from "../document-types";

type DocumentWithKB = RAGDocument & { knowledge_base_name?: string | null };

type DocumentListProps = {
  initialDocuments: DocumentWithKB[];
  knowledgeBaseId?: string;
  knowledgeBaseName?: string;
};

export function DocumentList({ initialDocuments, knowledgeBaseId, knowledgeBaseName }: DocumentListProps) {
  const router = useRouter();
  const [viewMode, setViewMode] = useViewMode("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({
    "Source Type": [],
    "Content Type": [],
    Status: [],
    "Should Chunk": [],
  });
  const [selectedSort, setSelectedSort] = useState<string>("Recent");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteDocument, setDeleteDocument] = useState<RAGDocument | null>(null);
  const [markdownModalOpen, setMarkdownModalOpen] = useState(false);
  const [markdownContent, setMarkdownContent] = useState<{ title: string; content: string } | null>(null);

  // Get unique values for filters
  const uniqueSourceTypes = useMemo(() => {
    const types = new Set(initialDocuments.map(d => d.source_type).filter((t): t is string => Boolean(t)));
    return Array.from(types).sort();
  }, [initialDocuments]);

  const uniqueContentTypes = useMemo(() => {
    const types = new Set(initialDocuments.map(d => d.content_type).filter((t): t is string => Boolean(t)));
    return Array.from(types).sort();
  }, [initialDocuments]);

  const filterCategories: FilterCategory[] = [
    {
      label: "Source Type",
      options: uniqueSourceTypes.map(type => ({ value: type, label: type })),
    },
    {
      label: "Content Type",
      options: uniqueContentTypes.map(type => ({ value: type, label: type })),
    },
    {
      label: "Status",
      options: [
        { value: "ready", label: "Ready" },
        { value: "processing", label: "Processing" },
        { value: "failed", label: "Failed" },
        { value: "completed", label: "Completed" },
      ],
    },
    {
      label: "Should Chunk",
      options: [
        { value: "true", label: "Yes" },
        { value: "false", label: "No" },
      ],
    },
  ];

  const filteredAndSortedDocuments = useMemo(() => {
    let filtered = initialDocuments;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((doc) => {
        const titleMatch = doc.title?.toLowerCase().includes(query);
        const contentMatch = doc.content?.toLowerCase().includes(query);
        const kbMatch = doc.knowledge_base_name?.toLowerCase().includes(query);
        return titleMatch || contentMatch || kbMatch;
      });
    }

    // Apply source type filter
    const selectedSourceTypes = selectedFilters["Source Type"] || [];
    if (selectedSourceTypes.length > 0) {
      filtered = filtered.filter((doc) =>
        selectedSourceTypes.includes(doc.source_type)
      );
    }

    // Apply content type filter
    const selectedContentTypes = selectedFilters["Content Type"] || [];
    if (selectedContentTypes.length > 0) {
      filtered = filtered.filter((doc) =>
        doc.content_type && selectedContentTypes.includes(doc.content_type)
      );
    }

    // Apply status filter
    const selectedStatuses = selectedFilters["Status"] || [];
    if (selectedStatuses.length > 0) {
      filtered = filtered.filter((doc) =>
        selectedStatuses.includes(doc.status)
      );
    }

    // Apply should chunk filter
    const selectedShouldChunk = selectedFilters["Should Chunk"] || [];
    if (selectedShouldChunk.length > 0) {
      filtered = filtered.filter((doc) => {
        const shouldChunkStr = doc.should_chunk ? "true" : "false";
        return selectedShouldChunk.includes(shouldChunkStr);
      });
    }

    // Apply sorting
    const sorted = [...filtered];
    switch (selectedSort) {
      case "Recent":
        sorted.sort((a, b) => 
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        );
        break;
      case "Title":
        sorted.sort((a, b) => {
          const aTitle = a.title || "";
          const bTitle = b.title || "";
          return aTitle.localeCompare(bTitle);
        });
        break;
      case "Chunk Count":
        sorted.sort((a, b) => b.chunk_count - a.chunk_count);
        break;
      case "File Size":
        sorted.sort((a, b) => {
          const aSize = a.file_size || 0;
          const bSize = b.file_size || 0;
          return bSize - aSize;
        });
        break;
      default:
        sorted.sort((a, b) => 
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        );
    }

    return sorted;
  }, [initialDocuments, searchQuery, selectedFilters, selectedSort]);

  const handleFilterApply = (filters: Record<string, string[]>) => {
    setSelectedFilters(filters);
  };

  const handleFilterClear = () => {
    setSelectedFilters({
      "Source Type": [],
      "Content Type": [],
      Status: [],
      "Should Chunk": [],
    });
  };

  const handleView = async (doc: RAGDocument) => {
    try {
      const result = await getDocumentUrl(doc.id);
      
      if (!result.success) {
        toast.error(result.error || "Failed to get document URL");
        return;
      }

      if (result.isPastedText) {
        // Show markdown modal for pasted text
        setMarkdownContent({
          title: doc.title || "Document Content",
          content: doc.content || "",
        });
        setMarkdownModalOpen(true);
      } else if (result.url) {
        // Open URL in new tab for uploaded files
        window.open(result.url, "_blank", "noopener,noreferrer");
      } else {
        toast.error("Document URL not available");
      }
    } catch (error: any) {
      console.error("Error viewing document:", error);
      toast.error(error.message || "Failed to view document");
    }
  };

  const handleDownload = async (doc: RAGDocument) => {
    try {
      toast.loading("Downloading...", { id: "download" });

      const result = await downloadDocument(doc.id, doc.title);
      
      if (result.success) {
        toast.success("File downloaded", { id: "download" });
      } else {
        toast.error(result.error || "Failed to download file", { id: "download" });
      }
    } catch (error: any) {
      console.error("Error downloading file:", error);
      toast.error(error.message || "Failed to download file", { id: "download" });
    }
  };

  const handleDelete = (doc: RAGDocument) => {
    setDeleteDocument(doc);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDocument || !deleteDocument.knowledge_base_id) {
      toast.error("Cannot delete document: missing knowledge base ID");
      return;
    }

    try {
      const result = await removeDocument({
        knowledge_base_id: deleteDocument.knowledge_base_id,
        document_id: deleteDocument.id,
      });

      if (result.success) {
        toast.success("Document deleted successfully");
        setDeleteDocument(null);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to delete document");
      }
    } catch (error: any) {
      console.error("Error deleting document:", error);
      toast.error(error.message || "Failed to delete document");
    }
  };

  return (
    <>
      <div className="w-full space-y-6">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Search */}
          <div className="relative w-72">
            <FontAwesomeIcon
              icon={faSearch}
              className="absolute left-3 top-1/2 -translate-y-1/2 !h-3 !w-3 text-muted-foreground"
              style={{ fontSize: '12px', width: '12px', height: '12px' }}
            />
            <Input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10 bg-muted/20 shadow-buttons border-0 border-foreground/70"
            />
          </div>

          {/* Right: Filter + Sort + View Toggle + Primary Action */}
          <Toolbar
            searchPlaceholder=""
            onSearch={undefined}
            filterCategories={filterCategories}
            selectedFilters={selectedFilters}
            onFilterApply={handleFilterApply}
            onFilterClear={handleFilterClear}
            sortOptions={["Recent", "Title", "Chunk Count", "File Size"]}
            selectedSort={selectedSort}
            onSortChange={setSelectedSort}
            primaryAction={{
              label: "New",
              onClick: () => setIsAddModalOpen(true),
            }}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
        </div>

        {filteredAndSortedDocuments.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/60 bg-muted/30 p-8 text-center text-muted-foreground">
            {initialDocuments.length === 0
              ? "No documents found."
              : "No documents found matching your search"}
          </div>
        ) : viewMode === "grid" ? (
          <DocumentGrid
            documents={filteredAndSortedDocuments}
            onView={handleView}
            onDownload={handleDownload}
            onDelete={handleDelete}
          />
        ) : (
          <DocumentTable
            documents={filteredAndSortedDocuments}
            onView={handleView}
            onDownload={handleDownload}
            onDelete={handleDelete}
          />
        )}
      </div>

      <DocumentModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        knowledgeBaseId={knowledgeBaseId}
        knowledgeBaseName={knowledgeBaseName}
        onSuccess={() => {
          router.refresh();
        }}
      />

      <RemoveDocumentDialog
        open={!!deleteDocument}
        onOpenChange={(open) => {
          if (!open) setDeleteDocument(null);
        }}
        document={deleteDocument}
        onConfirm={handleDeleteConfirm}
      />

      {markdownContent && (
        <MarkdownContentModal
          open={markdownModalOpen}
          onOpenChange={setMarkdownModalOpen}
          title={markdownContent.title}
          content={markdownContent.content}
        />
      )}
    </>
  );
}


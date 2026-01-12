"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Toolbar } from "@/features/rag/shared/components/Toolbar";
import type { FilterCategory } from "@/features/rag/shared/components/RAGFilterMenu";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { TooltipProvider } from "@/components/ui/tooltip";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { DocumentTable } from "./DocumentTable";
import { DocumentRow } from "./DocumentRow";
import { DocumentModal } from "./DocumentModal";
import { DeleteConfirmationDialog } from "@/features/rag/shared/components/DeleteConfirmationDialog";
import { MarkdownContentModal } from "./MarkdownContentModal";
import { GenerateReportModal } from "@/features/rag/workflows/components/GenerateReportModal";
import { removeDocument, downloadDocument } from "../document-api";
import type { RAGDocument } from "../document-types";
import { cn } from "@/lib/utils";

type DocumentWithKB = RAGDocument & { 
  knowledge_base_name?: string | null;
  is_workspace_document?: boolean;
};

type DocumentListProps = {
  initialDocuments: DocumentWithKB[];
  knowledgeBaseId?: string;
  knowledgeBaseName?: string;
  projectId?: string; // New: for linking documents
  researchSubjectId?: string; // For research context - show only Generate button
  researchSubjectType?: string | null; // Research subject type for filtering workflows
};

const STORAGE_KEY_PREFIX = "documents-";
const STORAGE_KEY_SEARCH = `${STORAGE_KEY_PREFIX}search`;
const STORAGE_KEY_FILTERS = `${STORAGE_KEY_PREFIX}filters`;
const STORAGE_KEY_SORT = `${STORAGE_KEY_PREFIX}sort`;
const STORAGE_KEY_GROUP_BY_SOURCE = `${STORAGE_KEY_PREFIX}group-by-source`;

// Helper functions for localStorage persistence
function getStoredSearch(): string {
  if (typeof window === "undefined") return "";
  try {
    return localStorage.getItem(STORAGE_KEY_SEARCH) || "";
  } catch {
    return "";
  }
}

function setStoredSearch(value: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_SEARCH, value);
  } catch {
    // Ignore localStorage errors
  }
}

function getStoredFilters(): Record<string, string[]> {
  if (typeof window === "undefined") return { "Source Type": [], "Content Type": [], Status: [], "Should Chunk": [] };
  try {
    const stored = localStorage.getItem(STORAGE_KEY_FILTERS);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed && typeof parsed === "object" ? parsed : { "Source Type": [], "Content Type": [], Status: [], "Should Chunk": [] };
    }
  } catch {
    // Ignore parse errors
  }
  return { "Source Type": [], "Content Type": [], Status: [], "Should Chunk": [] };
}

function setStoredFilters(filters: Record<string, string[]>): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_FILTERS, JSON.stringify(filters));
  } catch {
    // Ignore localStorage errors
  }
}

function getStoredSort(): string {
  if (typeof window === "undefined") return "Recent";
  try {
    return localStorage.getItem(STORAGE_KEY_SORT) || "Recent";
  } catch {
    return "Recent";
  }
}

function setStoredSort(value: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_SORT, value);
  } catch {
    // Ignore localStorage errors
  }
}

function getStoredGroupBySource(): string {
  if (typeof window === "undefined") return "none";
  try {
    const saved = localStorage.getItem(STORAGE_KEY_GROUP_BY_SOURCE);
    if (saved === "true") {
      // Migrate from old boolean format
      localStorage.setItem(STORAGE_KEY_GROUP_BY_SOURCE, "workspace-linked");
      return "workspace-linked";
    }
    if (saved === "false") {
      localStorage.setItem(STORAGE_KEY_GROUP_BY_SOURCE, "none");
      return "none";
    }
    return saved || "none";
  } catch {
    return "none";
  }
}

function setStoredGroupBySource(value: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_GROUP_BY_SOURCE, value);
  } catch {
    // Ignore localStorage errors
  }
}

export function DocumentList({ initialDocuments, knowledgeBaseId, knowledgeBaseName, projectId, researchSubjectId, researchSubjectType }: DocumentListProps) {
  const router = useRouter();
  // Initialize state from localStorage directly to avoid flash of default values
  const [searchQuery, setSearchQuery] = useState(() => getStoredSearch());
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>(() => getStoredFilters());
  const [selectedSort, setSelectedSort] = useState<string>(() => getStoredSort());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [deleteDocument, setDeleteDocument] = useState<RAGDocument | null>(null);
  const [markdownModalOpen, setMarkdownModalOpen] = useState(false);
  const [markdownContent, setMarkdownContent] = useState<{ title: string; content: string } | null>(null);
  const [groupBySource, setGroupBySource] = useState(() => getStoredGroupBySource());
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const hasInitializedExpansion = useRef(false);
  const hasLoadedFromStorage = useRef(false);

  // Mark as loaded after first render
  useEffect(() => {
    hasLoadedFromStorage.current = true;
  }, []);

  // Check if we have documents with is_workspace_document flag (project context)
  const hasSourceInfo = useMemo(() => {
    return initialDocuments.some(doc => (doc as DocumentWithKB).is_workspace_document !== undefined);
  }, [initialDocuments]);

  // Expand all groups by default when grouping is first enabled
  useEffect(() => {
    if (groupBySource !== "none" && hasSourceInfo && !hasInitializedExpansion.current) {
      setExpandedGroups(new Set(["workspace", "linked"]));
      hasInitializedExpansion.current = true;
    }
    if (groupBySource === "none") {
      hasInitializedExpansion.current = false;
    }
  }, [groupBySource, hasSourceInfo]);

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

  // Group documents by workspace/linked when grouping is enabled
  const groupedDocuments = useMemo(() => {
    if (groupBySource === "none" || !hasSourceInfo) {
      return null;
    }

    const groups: { workspace: DocumentWithKB[]; linked: DocumentWithKB[] } = {
      workspace: [],
      linked: [],
    };

    filteredAndSortedDocuments.forEach((doc) => {
      const docWithSource = doc as DocumentWithKB;
      if (docWithSource.is_workspace_document === true) {
        groups.workspace.push(docWithSource);
      } else if (docWithSource.is_workspace_document === false) {
        groups.linked.push(docWithSource);
      }
    });

    return groups;
  }, [filteredAndSortedDocuments, groupBySource, hasSourceInfo]);

  const toggleGroup = (groupName: string) => {
    setExpandedGroups((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(groupName)) {
        newSet.delete(groupName);
      } else {
        newSet.add(groupName);
      }
      return newSet;
    });
  };

  // Persist search query changes (only after initial load)
  useEffect(() => {
    if (hasLoadedFromStorage.current) {
      setStoredSearch(searchQuery);
    }
  }, [searchQuery]);

  // Persist filter changes (only after initial load)
  useEffect(() => {
    if (hasLoadedFromStorage.current) {
      setStoredFilters(selectedFilters);
    }
  }, [selectedFilters]);

  // Persist sort changes (only after initial load)
  useEffect(() => {
    if (hasLoadedFromStorage.current) {
      setStoredSort(selectedSort);
    }
  }, [selectedSort]);

  // Persist groupBySource changes (only after initial load)
  useEffect(() => {
    if (hasLoadedFromStorage.current) {
      setStoredGroupBySource(groupBySource);
    }
  }, [groupBySource]);

  const handleFilterApply = (filters: Record<string, string[]>) => {
    setSelectedFilters(filters);
  };

  const handleFilterClear = () => {
    const clearedFilters = {
      "Source Type": [],
      "Content Type": [],
      Status: [],
      "Should Chunk": [],
    };
    setSelectedFilters(clearedFilters);
  };

  const handleView = (doc: RAGDocument) => {
    // Always open markdown modal
    setMarkdownContent({
      title: doc.title || "Document Content",
      content: doc.content || "No content available for this document.",
    });
    setMarkdownModalOpen(true);
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
      <div className="w-full space-y-3">
        <Toolbar
          searchPlaceholder="Search documents..."
          searchValue={searchQuery}
          onSearch={setSearchQuery}
          filterCategories={filterCategories}
          selectedFilters={selectedFilters}
          onFilterApply={handleFilterApply}
          onFilterClear={handleFilterClear}
          sortOptions={["Recent", "Title", "Chunk Count", "File Size"]}
          selectedSort={selectedSort}
          onSortChange={setSelectedSort}
          primaryAction={researchSubjectId ? undefined : {
            label: "New",
            onClick: () => setIsAddModalOpen(true),
          }}
          secondaryAction={undefined}
          groupBySource={hasSourceInfo ? {
            options: [
              { value: "none", label: "None" },
              { value: "workspace-linked", label: "Workspace/Linked" },
            ],
            selectedValue: groupBySource,
            onSelect: (value: string) => {
              setGroupBySource(value);
            },
          } : undefined}
        />

        {filteredAndSortedDocuments.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-xl border border-dashed border-border/60 bg-muted/30 p-8 text-center text-muted-foreground"
          >
            {initialDocuments.length === 0
              ? "No documents found."
              : "No documents found matching your search"}
          </motion.div>
        ) : (
          groupBySource !== "none" && groupedDocuments ? (
            <TooltipProvider delayDuration={100}>
              <div className="space-y-2">
                {/* Table Header */}
                <div className="flex items-center gap-4 px-4 py-3 bg-muted/50 rounded-lg text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  <div className="flex-1 min-w-0">Name</div>
                  <div className="w-20 shrink-0">Size</div>
                  <div className="w-24 shrink-0">Status</div>
                  {(!knowledgeBaseId || filteredAndSortedDocuments.some(doc => (doc as any).knowledge_base_name)) && (
                    <div className="w-32 shrink-0">Knowledge Base</div>
                  )}
                  <div className="w-28 shrink-0">Uploaded</div>
                  <div className="w-20 shrink-0 text-right">Actions</div>
                </div>

                {/* Workspace Group */}
                {groupedDocuments.workspace.length > 0 && (
                  <Collapsible
                    open={expandedGroups.has("workspace")}
                    onOpenChange={() => toggleGroup("workspace")}
                  >
                    <CollapsibleTrigger className="w-full flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors rounded-lg">
                      <FontAwesomeIcon
                        icon={expandedGroups.has("workspace") ? faChevronDown : faChevronRight}
                        className="h-4 w-4 text-muted-foreground shrink-0"
                      />
                      <div className="flex items-center gap-2 flex-1">
                        <span className="h-2 w-2 rounded-full bg-primary"></span>
                        <h3 className="text-sm font-semibold text-foreground">Workspace Documents</h3>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {groupedDocuments.workspace.length} {groupedDocuments.workspace.length === 1 ? "document" : "documents"}
                      </span>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="space-y-2 pt-2">
                        {groupedDocuments.workspace.map((doc) => {
                          const docWithKB = doc as DocumentWithKB;
                          return (
                            <DocumentRow
                              key={doc.id}
                              document={doc}
                              knowledgeBaseName={knowledgeBaseId && !docWithKB.knowledge_base_name ? undefined : (docWithKB.knowledge_base_name || knowledgeBaseName)}
                              onView={handleView ? () => handleView(doc) : undefined}
                              onDownload={handleDownload ? () => handleDownload(doc) : undefined}
                              onDelete={handleDelete ? () => handleDelete(doc) : undefined}
                            />
                          );
                        })}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                )}

                {/* Linked Group */}
                {groupedDocuments.linked.length > 0 && (
                  <Collapsible
                    open={expandedGroups.has("linked")}
                    onOpenChange={() => toggleGroup("linked")}
                  >
                    <CollapsibleTrigger className="w-full flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors rounded-lg">
                      <FontAwesomeIcon
                        icon={expandedGroups.has("linked") ? faChevronDown : faChevronRight}
                        className="h-4 w-4 text-muted-foreground shrink-0"
                      />
                      <div className="flex items-center gap-2 flex-1">
                        <span className="h-2 w-2 rounded-full bg-muted-foreground/30"></span>
                        <h3 className="text-sm font-semibold text-foreground">Linked Documents</h3>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {groupedDocuments.linked.length} {groupedDocuments.linked.length === 1 ? "document" : "documents"}
                      </span>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="space-y-2 pt-2">
                        {groupedDocuments.linked.map((doc) => {
                          const docWithKB = doc as DocumentWithKB;
                          return (
                            <DocumentRow
                              key={doc.id}
                              document={doc}
                              knowledgeBaseName={knowledgeBaseId && !docWithKB.knowledge_base_name ? undefined : (docWithKB.knowledge_base_name || knowledgeBaseName)}
                              onView={handleView ? () => handleView(doc) : undefined}
                              onDownload={handleDownload ? () => handleDownload(doc) : undefined}
                              onDelete={handleDelete ? () => handleDelete(doc) : undefined}
                            />
                          );
                        })}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                )}
              </div>
            </TooltipProvider>
          ) : (
            <DocumentTable
              documents={filteredAndSortedDocuments}
              knowledgeBaseName={knowledgeBaseName}
              hideKnowledgeBase={!!knowledgeBaseId}
              onView={handleView}
              onDownload={handleDownload}
              onDelete={handleDelete}
            />
          )
        )}
      </div>

      <DocumentModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        knowledgeBaseId={knowledgeBaseId}
        knowledgeBaseName={knowledgeBaseName}
        projectId={projectId}
        onSuccess={() => {
          router.refresh();
        }}
      />

      <DeleteConfirmationDialog
        open={!!deleteDocument}
        onOpenChange={(open) => {
          if (!open) setDeleteDocument(null);
        }}
        title="Remove document?"
        description={
          deleteDocument
            ? `This will permanently remove "${deleteDocument.title || "Untitled document"}" and all its associated chunks and embeddings from the knowledge base. This action cannot be undone.`
            : undefined
        }
        entityName={deleteDocument?.title || "Untitled document"}
        entityType="document"
        onConfirm={handleDeleteConfirm}
        confirmLabel="Remove"
      />

      {markdownContent && (
        <MarkdownContentModal
          open={markdownModalOpen}
          onOpenChange={setMarkdownModalOpen}
          title={markdownContent.title}
          content={markdownContent.content}
        />
      )}

      {researchSubjectId && (
        <GenerateReportModal
          open={isGenerateModalOpen}
          onOpenChange={setIsGenerateModalOpen}
          projectType={researchSubjectType || null}
          subjectType={researchSubjectType || null}
          researchSubjectId={researchSubjectId}
        />
      )}
    </>
  );
}


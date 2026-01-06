"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner, faSearch, faChevronDown, faChevronRight, faEye } from "@fortawesome/free-solid-svg-icons";
import { cn } from "@/lib/utils";
import type { RAGDocument } from "../document-types";
import { RAGInput } from "../../shared/components";
import { DocumentContentDrawer } from "./DocumentContentDrawer";

type DocumentWithKB = RAGDocument & { knowledge_base_name?: string | null };

interface LinkDocumentsListProps {
  projectId: string;
  kbId: string;
  onSelectionChange: (selectedIds: string[]) => void;
  selectedDocumentIds: string[];
}

export function LinkDocumentsList({
  projectId,
  kbId,
  onSelectionChange,
  selectedDocumentIds,
}: LinkDocumentsListProps) {
  const [documents, setDocuments] = useState<DocumentWithKB[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedKBs, setExpandedKBs] = useState<Set<string>>(new Set());
  const [viewingDocument, setViewingDocument] = useState<DocumentWithKB | null>(null);
  const hasInitializedExpansion = useRef(false);

  useEffect(() => {
    async function fetchDocuments() {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(
          `/api/intel/documents?project_id=${projectId}&kb_id=${kbId}`
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to fetch documents");
        }

        const data = await response.json();
        setDocuments(data.documents || []);
      } catch (err) {
        console.error("Error fetching documents:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch documents");
      } finally {
        setLoading(false);
      }
    }

    if (projectId && kbId) {
      fetchDocuments();
    }
  }, [projectId, kbId]);

  // Expand all KBs by default when documents first load (only once)
  useEffect(() => {
    if (documents.length > 0 && !hasInitializedExpansion.current) {
      const kbNames = new Set(documents.map(doc => doc.knowledge_base_name || "Unknown"));
      setExpandedKBs(kbNames);
      hasInitializedExpansion.current = true;
    }
  }, [documents]);

  // Filter documents by search query
  const filteredDocuments = useMemo(() => {
    if (!searchQuery.trim()) {
      return documents;
    }
    const query = searchQuery.toLowerCase();
    return documents.filter((doc) => {
      const titleMatch = doc.title?.toLowerCase().includes(query);
      const kbMatch = doc.knowledge_base_name?.toLowerCase().includes(query);
      return titleMatch || kbMatch;
    });
  }, [documents, searchQuery]);

  // Group documents by knowledge base
  const groupedDocuments = useMemo(() => {
    const groups: Record<string, DocumentWithKB[]> = {};
    filteredDocuments.forEach((doc) => {
      const kbName = doc.knowledge_base_name || "Unknown";
      if (!groups[kbName]) {
        groups[kbName] = [];
      }
      groups[kbName].push(doc);
    });
    return groups;
  }, [filteredDocuments]);

  const toggleKB = (kbName: string) => {
    setExpandedKBs((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(kbName)) {
        newSet.delete(kbName);
      } else {
        newSet.add(kbName);
      }
      return newSet;
    });
  };

  const handleToggleDocument = (documentId: string) => {
    const newSelection = selectedDocumentIds.includes(documentId)
      ? selectedDocumentIds.filter((id) => id !== documentId)
      : [...selectedDocumentIds, documentId];
    onSelectionChange(newSelection);
  };

  const handleViewDocument = (e: React.MouseEvent, doc: DocumentWithKB) => {
    e.stopPropagation();
    setViewingDocument(doc);
  };


  const formattedDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const statusColors: Record<string, string> = {
    ready: "bg-green-600/10 text-green-600 dark:text-green-400",
    processing: "bg-yellow-600/10 text-yellow-600 dark:text-yellow-400",
    failed: "bg-destructive/10 text-destructive",
    completed: "bg-blue-600/10 text-blue-600 dark:text-blue-400",
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <FontAwesomeIcon
          icon={faSpinner}
          className="h-6 w-6 animate-spin text-muted-foreground"
        />
        <span className="ml-2 text-sm text-muted-foreground">
          Loading documents...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
        {error}
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border/60 bg-muted/30 p-8 text-center text-muted-foreground">
        No documents available to link
      </div>
    );
  }

  const hasResults = Object.keys(groupedDocuments).length > 0;

  // Calculate total selected count
  const totalSelected = selectedDocumentIds.length;

  // Calculate selected count per KB group
  const getSelectedCountInGroup = (groupDocs: DocumentWithKB[]) => {
    return groupDocs.filter((doc) => selectedDocumentIds.includes(doc.id)).length;
  };

  return (
    <div className="space-y-3 pt-2">
      {/* Search Bar with Selection Count Inline */}
      <div className="relative">
        <FontAwesomeIcon
          icon={faSearch}
          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10"
        />
        <RAGInput
          placeholder="Search documents or knowledge bases..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={cn(
            "pl-9 h-8 bg-tr",   
            totalSelected > 0 && "pr-24"
          )}
        />
        {totalSelected > 0 && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">
            <Badge variant="secondary" className="text-xs h-5 px-2">
              {totalSelected} {totalSelected === 1 ? "selected" : "selected"}
            </Badge>
          </div>
        )}
      </div>

      {/* Documents List */}
      {hasResults ? (
        <div className="space-y-2 overflow-y-auto">
          {Object.entries(groupedDocuments).map(([kbName, groupDocs]) => {
            const isExpanded = expandedKBs.has(kbName);
            const selectedInGroup = getSelectedCountInGroup(groupDocs);

            return (
              <Collapsible
                key={kbName}
                open={isExpanded}
                onOpenChange={() => toggleKB(kbName)}
                className="rounded-lg overflow-hidden"
              >
                {/* KB Header with Toggle */}
                <CollapsibleTrigger className="w-full flex items-center gap-3 p-3 transition-colors">
                  <FontAwesomeIcon
                    icon={isExpanded ? faChevronDown : faChevronRight}
                    className="h-4 w-4 text-muted-foreground shrink-0"
                  />
                  <h3 className="text-sm font-semibold text-foreground flex-1 text-left">
                    {kbName}
                  </h3>
                  <div className="flex items-center gap-2 shrink-0 min-w-[120px] justify-end">
                    <div className="h-5 flex items-center">
                      {selectedInGroup > 0 ? (
                        <Badge variant="secondary" className="text-xs bg-primary/10 text-primary h-5 px-2">
                          {selectedInGroup} selected
                        </Badge>
                      ) : (
                        <span className="h-5"></span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {groupDocs.length} {groupDocs.length === 1 ? "document" : "documents"}
                    </span>
                  </div>
                </CollapsibleTrigger>

                {/* Documents in this KB */}
                <CollapsibleContent className="px-3 pb-3 space-y-2">
                  {groupDocs.map((doc) => {
                    const isSelected = selectedDocumentIds.includes(doc.id);
                    const statusColorClass =
                      statusColors[doc.status] || statusColors.ready;

                    return (
                      <div
                        key={doc.id}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer bg-card shadow-card-light w-full max-w-full overflow-hidden",
                          isSelected
                            ? "border-primary bg-primary/5"
                            : "border-border/50 hover:border-primary/50 hover:bg-accent/100"
                        )}
                        onClick={() => handleToggleDocument(doc.id)}
                      >
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => handleToggleDocument(doc.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="shrink-0 flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0 max-w-full overflow-hidden">
                          <div className="mb-1 min-w-0">
                            <p className="text-sm font-medium truncate w-full">
                              {doc.title || "Untitled Document"}
                            </p>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground min-w-0 overflow-hidden">
                            {doc.should_chunk && doc.chunk_count > 0 && (
                              <span className="flex items-center gap-1 shrink-0 flex-shrink-0 whitespace-nowrap">
                                <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
                                <span>{doc.chunk_count} chunks</span>
                              </span>
                            )}
                            <span className="truncate min-w-0">Created: {formattedDate(doc.created_at)}</span>
                          </div>
                        </div>
                        <button
                          onClick={(e) => handleViewDocument(e, doc)}
                          className="shrink-0 flex-shrink-0 p-1.5 rounded-md hover:bg-muted transition-colors flex items-center justify-center"
                          title="View document content"
                        >
                          <FontAwesomeIcon
                            icon={faEye}
                            className="h-4 w-4 text-muted-foreground hover:text-foreground"
                          />
                        </button>
                      </div>
                    );
                  })}
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-border/60 bg-muted/30 p-6 text-center text-sm text-muted-foreground">
          No documents found matching your search
        </div>
      )}

      {/* Document Content Drawer */}
      {viewingDocument && (
        <DocumentContentDrawer
          open={!!viewingDocument}
          onOpenChange={(open) => {
            if (!open) setViewingDocument(null);
          }}
          title={viewingDocument.title || "Untitled Document"}
          content={viewingDocument.content || "No content available for this document."}
        />
      )}
    </div>
  );
}


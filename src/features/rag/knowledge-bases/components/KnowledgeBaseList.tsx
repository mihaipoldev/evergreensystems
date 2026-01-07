"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Toolbar, type ViewMode } from "@/features/rag/shared/components/Toolbar";
import { useViewMode } from "@/features/rag/shared/hooks/useViewMode";
import type { FilterCategory } from "@/features/rag/shared/components/RAGFilterMenu";
import { KnowledgeBaseGrid } from "./KnowledgeBaseGrid";
import { KnowledgeBaseTable } from "./KnowledgeBaseTable";
import { KnowledgeBaseModal } from "./KnowledgeBaseModal";
import type { KnowledgeBaseWithCount } from "../data";
import type { KnowledgeBase } from "../types";
import { createClient } from "@/lib/supabase/client";

type KnowledgeBaseListProps = {
  initialKnowledge: KnowledgeBaseWithCount[];
};

const STORAGE_KEY_PREFIX = "knowledge-bases-";
const STORAGE_KEY_SEARCH = `${STORAGE_KEY_PREFIX}search`;
const STORAGE_KEY_FILTERS = `${STORAGE_KEY_PREFIX}filters`;
const STORAGE_KEY_SORT = `${STORAGE_KEY_PREFIX}sort`;
const STORAGE_KEY_SHOW_PROJECTS = "kb-show-projects";

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
  if (typeof window === "undefined") return { Type: [], "Active Status": [], Visibility: [] };
  try {
    const stored = localStorage.getItem(STORAGE_KEY_FILTERS);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed && typeof parsed === "object" ? parsed : { Type: [], "Active Status": [], Visibility: [] };
    }
  } catch {
    // Ignore parse errors
  }
  return { Type: [], "Active Status": [], Visibility: [] };
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

function getStoredShowProjects(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const saved = localStorage.getItem(STORAGE_KEY_SHOW_PROJECTS);
    return saved === "true";
  } catch {
    return false;
  }
}

function setStoredShowProjects(value: boolean): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_SHOW_PROJECTS, String(value));
  } catch {
    // Ignore localStorage errors
  }
}

export function KnowledgeBaseList({ initialKnowledge }: KnowledgeBaseListProps) {
  const router = useRouter();
  const [viewMode, setViewMode] = useViewMode("grid");
  // Initialize state from localStorage directly to avoid flash of default values
  const [searchQuery, setSearchQuery] = useState(() => getStoredSearch());
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>(() => getStoredFilters());
  const [selectedSort, setSelectedSort] = useState(() => getStoredSort());
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedKnowledgeBase, setSelectedKnowledgeBase] = useState<KnowledgeBase | null>(null);
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBaseWithCount[]>(initialKnowledge);
  const [showProjects, setShowProjects] = useState(() => getStoredShowProjects());
  const hasLoadedFromStorage = useRef(false);

  // Mark as loaded after first render
  useEffect(() => {
    hasLoadedFromStorage.current = true;
  }, []);

  const filterCategories: FilterCategory[] = [
    {
      label: "Type",
      options: [
        { value: "niche_intelligence", label: "Niche Intelligence" },
        { value: "support", label: "Contact Support" },
        { value: "internal", label: "Internal Operations" },
        { value: "project", label: "Project" },
        { value: "client", label: "Client" },
      ],
    },
    {
      label: "Active Status",
      options: [
        { value: "true", label: "Active" },
        { value: "false", label: "Inactive" },
      ],
    },
    {
      label: "Visibility",
      options: [
        { value: "public", label: "Public" },
        { value: "private", label: "Private" },
      ],
    },
  ];

  // Set up Supabase real-time subscription for knowledge bases
  useEffect(() => {
    const supabase = createClient();
    
    const channel = supabase
      .channel('rag_knowledge_bases_changes', {
        config: {
          broadcast: { self: true },
        },
      })
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rag_knowledge_bases',
        },
        async (payload) => {
          console.log('Knowledge base change detected:', {
            eventType: payload.eventType,
            new: payload.new,
            old: payload.old,
          });

          if (payload.eventType === 'INSERT' && payload.new) {
            const newKB = payload.new as KnowledgeBase;
            
            // Fetch document count for the new KB
            const { count } = await supabase
              .from("rag_documents")
              .select("*", { count: "exact", head: true })
              .eq("knowledge_base_id", newKB.id)
              .is("deleted_at", null);

            const newKBWithCount: KnowledgeBaseWithCount = {
              ...newKB,
              document_count: count || 0,
            };

            setKnowledgeBases((prev) => {
              const exists = prev.some((kb) => kb.id === newKB.id);
              if (exists) {
                return prev;
              }
              
              // Add new KB and sort by created_at descending
              const updated = [newKBWithCount, ...prev];
              return updated.sort((a, b) => 
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
              );
            });
          } else if (payload.eventType === 'UPDATE' && payload.new) {
            const updatedKB = payload.new as KnowledgeBase;
            
            setKnowledgeBases((prev) => {
              const exists = prev.some((kb) => kb.id === updatedKB.id);
              if (!exists) {
                // KB not in list, fetch document count and add it
                supabase
                  .from("rag_documents")
                  .select("*", { count: "exact", head: true })
                  .eq("knowledge_base_id", updatedKB.id)
                  .is("deleted_at", null)
                  .then(({ count }) => {
                    const updatedKBWithCount: KnowledgeBaseWithCount = {
                      ...updatedKB,
                      document_count: count || 0,
                    };
                    setKnowledgeBases((prevList) => {
                      const updatedList = [updatedKBWithCount, ...prevList];
                      return updatedList.sort((a, b) => 
                        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                      );
                    });
                  });
                return prev;
              }
              
              // Update existing KB, preserve document_count
              const updated = prev.map((kb) =>
                kb.id === updatedKB.id
                  ? { ...updatedKB, document_count: kb.document_count }
                  : kb
              );
              
              return updated;
            });
          } else if (payload.eventType === 'DELETE' && payload.old) {
            const deletedKB = payload.old as { id: string };
            
            setKnowledgeBases((prev) => {
              return prev.filter((kb) => kb.id !== deletedKB.id);
            });
          }
        }
      )
      .subscribe((status) => {
        console.log('Knowledge base subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('✅ Successfully subscribed to knowledge base changes');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Channel error - check Supabase real-time settings and ensure rag_knowledge_bases table has Realtime enabled');
        } else if (status === 'TIMED_OUT') {
          console.error('❌ Subscription timed out - Realtime connection issue');
        } else if (status === 'CLOSED') {
          console.log('⚠️ Subscription closed');
        }
      });

    return () => {
      console.log('Cleaning up knowledge base subscription');
      supabase.removeChannel(channel);
    };
  }, []);


  // Update knowledgeBases when initialKnowledge changes (from server refresh)
  useEffect(() => {
    setKnowledgeBases(initialKnowledge);
  }, [initialKnowledge]);

  const filteredAndSortedKnowledge = useMemo(() => {
    let filtered = knowledgeBases;

    // Default: hide projects unless toggle is on
    if (!showProjects) {
      filtered = filtered.filter((kb) => kb.kb_type !== "project");
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (knowledge) =>
          knowledge.name.toLowerCase().includes(query) ||
          (knowledge.description &&
            knowledge.description.toLowerCase().includes(query))
      );
    }

    // Apply type filter (using kb_type field which is what's stored in DB)
    const selectedTypes = selectedFilters["Type"] || [];
    if (selectedTypes.length > 0) {
      filtered = filtered.filter((knowledge) => {
        const kbType = knowledge.kb_type || "";
        return selectedTypes.includes(kbType);
      });
    }

    // Apply active status filter
    const selectedActiveStatus = selectedFilters["Active Status"] || [];
    if (selectedActiveStatus.length > 0) {
      filtered = filtered.filter((knowledge) => {
        const isActiveStr = knowledge.is_active ? "true" : "false";
        return selectedActiveStatus.includes(isActiveStr);
      });
    }

    // Apply visibility filter
    const selectedVisibility = selectedFilters["Visibility"] || [];
    if (selectedVisibility.length > 0) {
      filtered = filtered.filter((knowledge) => {
        return selectedVisibility.includes(knowledge.visibility);
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
      case "Name":
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "Size":
        sorted.sort((a, b) => b.document_count - a.document_count);
        break;
      default:
        // Default to Recent
        sorted.sort((a, b) => 
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        );
    }

    return sorted;
  }, [knowledgeBases, searchQuery, selectedFilters, selectedSort, showProjects]);

  const handleDelete = () => {
    router.refresh();
  };

  const handleEdit = (knowledgeBase: KnowledgeBase) => {
    setSelectedKnowledgeBase(knowledgeBase);
    setIsEditModalOpen(true);
  };

  const handleEditSuccess = (updatedKnowledgeBase: KnowledgeBase) => {
    // Update the selected knowledge base with the latest data from the API
    setSelectedKnowledgeBase(updatedKnowledgeBase);
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

  // Persist showProjects changes (only after initial load)
  useEffect(() => {
    if (hasLoadedFromStorage.current) {
      setStoredShowProjects(showProjects);
    }
  }, [showProjects]);

  const handleFilterApply = (filters: Record<string, string[]>) => {
    setSelectedFilters(filters);
  };

  const handleFilterClear = () => {
    const clearedFilters = {
      Type: [],
      "Active Status": [],
      Visibility: [],
    };
    setSelectedFilters(clearedFilters);
  };

  const handleToggleProjects = (show: boolean) => {
    setShowProjects(show);
  };

  return (
    <>
      <div className="w-full space-y-6">
        <Toolbar
          searchPlaceholder="Search knowledge bases..."
          searchValue={searchQuery}
          onSearch={setSearchQuery}
          filterCategories={filterCategories}
          selectedFilters={selectedFilters}
          onFilterApply={handleFilterApply}
          onFilterClear={handleFilterClear}
          sortOptions={["Recent", "Name", "Size"]}
          onSortChange={setSelectedSort}
          selectedSort={selectedSort}
          primaryAction={{
            label: "New",
            onClick: () => setIsCreateModalOpen(true),
          }}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          showProjectsToggle={{
            show: showProjects,
            onToggle: handleToggleProjects,
          }}
        />

        {filteredAndSortedKnowledge.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-xl border border-dashed border-border/60 bg-muted/30 p-8 text-center text-muted-foreground"
          >
            {knowledgeBases.length === 0
              ? "No knowledge bases. Create one to get started."
              : "No knowledge bases found matching your search"}
          </motion.div>
        ) : viewMode === "grid" ? (
          <KnowledgeBaseGrid
            knowledgeBases={filteredAndSortedKnowledge}
            onDelete={handleDelete}
            onEdit={handleEdit}
          />
        ) : (
          <KnowledgeBaseTable
            knowledgeBases={filteredAndSortedKnowledge}
            onDelete={handleDelete}
            onEdit={handleEdit}
          />
        )}
      </div>

      <KnowledgeBaseModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      />
      <KnowledgeBaseModal
        open={isEditModalOpen}
        onOpenChange={(open) => {
          setIsEditModalOpen(open);
          if (!open) {
            setSelectedKnowledgeBase(null);
          }
        }}
        initialData={selectedKnowledgeBase}
        onSuccess={handleEditSuccess}
      />
    </>
  );
}

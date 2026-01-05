"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Toolbar, type ViewMode } from "@/features/rag/shared/components/Toolbar";
import { useViewMode } from "@/features/rag/shared/hooks/useViewMode";
import type { FilterCategory } from "@/features/rag/shared/components/RAGFilterMenu";
import { KnowledgeBaseGrid } from "./KnowledgeBaseGrid";
import { KnowledgeBaseTable } from "./KnowledgeBaseTable";
import { KnowledgeBaseModal } from "./KnowledgeBaseModal";
import type { KnowledgeBaseWithCount } from "../data";
import type { KnowledgeBase } from "../types";
import { createClient } from "@/lib/supabase/client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { Input } from "@/components/ui/input";

type KnowledgeBaseListProps = {
  initialKnowledge: KnowledgeBaseWithCount[];
};

export function KnowledgeBaseList({ initialKnowledge }: KnowledgeBaseListProps) {
  const router = useRouter();
  const [viewMode, setViewMode] = useViewMode("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({
    Type: [],
    "Active Status": [],
    Visibility: [],
  });
  const [selectedSort, setSelectedSort] = useState("Recent");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedKnowledgeBase, setSelectedKnowledgeBase] = useState<KnowledgeBase | null>(null);
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBaseWithCount[]>(initialKnowledge);

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
  }, [knowledgeBases, searchQuery, selectedFilters, selectedSort]);

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

  const handleFilterApply = (filters: Record<string, string[]>) => {
    setSelectedFilters(filters);
  };

  const handleFilterClear = () => {
    setSelectedFilters({
      Type: [],
      "Active Status": [],
      Visibility: [],
    });
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
              placeholder="Search knowledge bases..."
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
            sortOptions={["Recent", "Name", "Size"]}
            onSortChange={setSelectedSort}
            selectedSort={selectedSort}
            primaryAction={{
              label: "New",
              onClick: () => setIsCreateModalOpen(true),
            }}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
        </div>

        {filteredAndSortedKnowledge.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/60 bg-muted/30 p-8 text-center text-muted-foreground">
            {knowledgeBases.length === 0
              ? "No knowledge bases. Create one to get started."
              : "No knowledge bases found matching your search"}
          </div>
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

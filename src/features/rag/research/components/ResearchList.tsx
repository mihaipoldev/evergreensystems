"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { Toolbar, type ViewMode } from "@/features/rag/shared/components/Toolbar";
import { useViewMode } from "@/features/rag/shared/hooks/useViewMode";
import type { FilterCategory } from "@/features/rag/shared/components/RAGFilterMenu";
import { ResearchGrid } from "./ResearchGrid";
import { ResearchTable } from "./ResearchTable";
import { ResearchModal } from "./ResearchModal";
import type { ResearchSubject } from "../types";

type ResearchListProps = {
  initialResearchSubjects: ResearchSubject[];
};

export function ResearchList({ initialResearchSubjects }: ResearchListProps) {
  const router = useRouter();
  const [viewMode, setViewMode] = useViewMode("grid");
  const [researchSubjects, setResearchSubjects] = useState<ResearchSubject[]>(initialResearchSubjects);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({
    Category: [],
    Geography: [],
    Type: [],
  });
  const [selectedSort, setSelectedSort] = useState("Recent");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedResearch, setSelectedResearch] = useState<ResearchSubject | null>(null);

  // Update research subjects when initialResearchSubjects changes
  // This syncs from server on initial load and after router.refresh()
  useEffect(() => {
    setResearchSubjects(initialResearchSubjects);
  }, [initialResearchSubjects]);

  // Set up Supabase real-time subscription for research subjects
  useEffect(() => {
    const supabase = createClient();
    
    console.log('🔌 Setting up research subjects subscription...');
    
    const channel = supabase
      .channel('research_subjects_changes', {
        config: {
          broadcast: { self: true },
        },
      })
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'research_subjects',
        },
        (payload) => {
          console.log('📄 Research subject change detected:', {
            eventType: payload.eventType,
            researchId: (payload.new as any)?.id || (payload.old as any)?.id,
            timestamp: new Date().toISOString(),
            hasNew: !!payload.new,
            hasOld: !!payload.old,
            fullPayload: payload,
          });

          // Log ALL events to debug
          if (payload.eventType === 'UPDATE') {
            console.log('🔍 UPDATE EVENT DETAILS:', {
              eventType: payload.eventType,
              new: payload.new,
              old: payload.old,
              table: payload.table,
              schema: payload.schema,
            });
          }

          if (payload.eventType === 'INSERT' && payload.new) {
            const newResearch = payload.new as any;
            
            console.log('✅ Adding new research subject to list:', newResearch.id);
            setResearchSubjects((prev) => {
              const exists = prev.some((r) => r.id === newResearch.id);
              if (exists) {
                console.log('⚠️ Research subject already exists in list, skipping INSERT');
                return prev;
              }
              
              // Add new research subject and sort by created_at descending
              const updated = [newResearch, ...prev];
              return updated.sort((a, b) => 
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
              );
            });
          } else if (payload.eventType === 'UPDATE' && payload.new) {
            const updatedResearch = payload.new as ResearchSubject;
            
            console.log('🔄 Processing UPDATE for research subject:', updatedResearch.id, {
              name: updatedResearch.name,
              updated_at: updatedResearch.updated_at,
            });
            
            setResearchSubjects((prev) => {
              const existingResearch = prev.find((r) => r.id === updatedResearch.id);
              
              // If research subject not in list, add it
              if (!existingResearch) {
                console.log('➕ Research subject not in list, adding:', updatedResearch.id);
                const updated = [updatedResearch, ...prev];
                return updated.sort((a, b) => 
                  new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                );
              }
              
              // Update existing research subject - simple replacement like workflows
              console.log('✅ Updating existing research subject in list:', updatedResearch.id, {
                oldName: existingResearch.name,
                newName: updatedResearch.name,
              });
              
              const updated = prev.map((r) =>
                r.id === updatedResearch.id
                  ? (updatedResearch as ResearchSubject)
                  : r
              );
              
              console.log('✅ State updated, new list length:', updated.length);
              return updated;
            });
          } else if (payload.eventType === 'DELETE' && payload.old) {
            const deletedResearch = payload.old as { id: string };
            
            console.log('🗑️ Processing DELETE for research subject:', deletedResearch.id);
            setResearchSubjects((prev) => {
              return prev.filter((r) => r.id !== deletedResearch.id);
            });
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Research subjects subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('✅ Successfully subscribed to research subjects changes');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Channel error - check Supabase real-time settings and ensure research_subjects table has Realtime enabled');
        } else if (status === 'TIMED_OUT') {
          console.error('❌ Subscription timed out - Realtime connection issue');
        } else if (status === 'CLOSED') {
          console.log('⚠️ Subscription closed');
        }
      });

    return () => {
      console.log('🧹 Cleaning up research subjects subscription');
      supabase.removeChannel(channel);
    };
  }, []); // Run once on mount

  // Get unique values for filters
  const uniqueCategories = useMemo(() => {
    const categories = new Set(researchSubjects.map(r => r.category).filter(Boolean));
    return Array.from(categories).sort();
  }, [researchSubjects]);

  const uniqueGeographies = useMemo(() => {
    const geographies = new Set(researchSubjects.map(r => r.geography).filter(Boolean));
    return Array.from(geographies).sort();
  }, [researchSubjects]);

  const uniqueTypes = useMemo(() => {
    const types = new Set(researchSubjects.map(r => r.type).filter(Boolean));
    return Array.from(types).sort();
  }, [researchSubjects]);

  const filterCategories: FilterCategory[] = [
    {
      label: "Category",
      options: uniqueCategories.map(cat => ({ value: cat!, label: cat! })),
    },
    {
      label: "Geography",
      options: uniqueGeographies.map(geo => ({ value: geo!, label: geo! })),
    },
    {
      label: "Type",
      options: uniqueTypes.map(type => ({ value: type!, label: type! })),
    },
  ];

  const filteredAndSortedResearch = useMemo(() => {
    let filtered = researchSubjects;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (research) =>
          research.name.toLowerCase().includes(query) ||
          (research.description && research.description.toLowerCase().includes(query)) ||
          (research.category && research.category.toLowerCase().includes(query)) ||
          (research.geography && research.geography.toLowerCase().includes(query))
      );
    }

    // Apply category filter
    const selectedCategories = selectedFilters["Category"] || [];
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((research) =>
        research.category && selectedCategories.includes(research.category)
      );
    }

    // Apply geography filter
    const selectedGeographies = selectedFilters["Geography"] || [];
    if (selectedGeographies.length > 0) {
      filtered = filtered.filter((research) =>
        research.geography && selectedGeographies.includes(research.geography)
      );
    }

    // Apply type filter
    const selectedTypes = selectedFilters["Type"] || [];
    if (selectedTypes.length > 0) {
      filtered = filtered.filter((research) =>
        research.type && selectedTypes.includes(research.type)
      );
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
      case "Run Count":
        sorted.sort((a, b) => (b.run_count || 0) - (a.run_count || 0));
        break;
      default:
        sorted.sort((a, b) => 
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        );
    }

    return sorted;
  }, [researchSubjects, searchQuery, selectedFilters, selectedSort]);

  const handleDelete = () => {
    router.refresh();
  };

  const handleEdit = (research: ResearchSubject) => {
    setSelectedResearch(research);
    setIsEditModalOpen(true);
  };

  const handleEditSuccess = (updatedResearch: ResearchSubject) => {
    setSelectedResearch(null);
    setIsEditModalOpen(false);
    // Don't call router.refresh() - let the real-time subscription handle the update
    // router.refresh() would overwrite real-time updates
  };

  const handleFilterApply = (filters: Record<string, string[]>) => {
    setSelectedFilters(filters);
  };

  const handleFilterClear = () => {
    setSelectedFilters({
      Category: [],
      Geography: [],
      Type: [],
    });
  };

  return (
    <div className="w-full space-y-6">
      <Toolbar
        searchPlaceholder="Search research subjects..."
        onSearch={setSearchQuery}
        filterCategories={filterCategories}
        selectedFilters={selectedFilters}
        onFilterApply={handleFilterApply}
        onFilterClear={handleFilterClear}
        sortOptions={["Recent", "Name", "Run Count"]}
        onSortChange={setSelectedSort}
        selectedSort={selectedSort}
        primaryAction={{
          label: "New",
          onClick: () => setIsCreateModalOpen(true),
        }}
        secondaryAction={{
          label: "Generate",
          onClick: () => {
            // TODO: Implement generate functionality
            console.log("Generate clicked");
          },
          disabled: false,
        }}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {filteredAndSortedResearch.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-xl border border-dashed border-border/60 bg-muted/30 p-8 text-center text-muted-foreground"
        >
          {researchSubjects.length === 0
            ? "No research subjects. Create one to get started."
            : "No research subjects found matching your search"}
        </motion.div>
      ) : viewMode === "grid" ? (
        <ResearchGrid researchSubjects={filteredAndSortedResearch} onDelete={handleDelete} onEdit={handleEdit} />
      ) : (
        <ResearchTable researchSubjects={filteredAndSortedResearch} onDelete={handleDelete} onEdit={handleEdit} />
      )}

      <ResearchModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSuccess={() => {
          router.refresh();
        }}
      />

      <ResearchModal
        open={isEditModalOpen}
        onOpenChange={(open) => {
          setIsEditModalOpen(open);
          if (!open) setSelectedResearch(null);
        }}
        initialData={selectedResearch}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
}


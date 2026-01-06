"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { Toolbar, type ViewMode } from "@/features/rag/shared/components/Toolbar";
import { useViewMode } from "@/features/rag/shared/hooks/useViewMode";
import type { FilterCategory } from "@/features/rag/shared/components/RAGFilterMenu";
import { SubjectTypesGrid } from "./SubjectTypesGrid";
import { SubjectTypesTable } from "./SubjectTypesTable";
import { SubjectTypeModal } from "./SubjectTypeModal";
import type { SubjectType } from "../types";

type SubjectTypesListProps = {
  initialSubjectTypes: SubjectType[];
};

export function SubjectTypesList({ initialSubjectTypes }: SubjectTypesListProps) {
  const router = useRouter();
  const [viewMode, setViewMode] = useViewMode("grid");
  const [subjectTypes, setSubjectTypes] = useState<SubjectType[]>(initialSubjectTypes);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({
    Status: [],
  });
  const [selectedSort, setSelectedSort] = useState("Recent");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedSubjectType, setSelectedSubjectType] = useState<SubjectType | null>(null);

  // Update subject types when initialSubjectTypes changes
  useEffect(() => {
    setSubjectTypes(initialSubjectTypes);
  }, [initialSubjectTypes]);

  // Set up Supabase real-time subscription for subject types
  useEffect(() => {
    const supabase = createClient();
    
    console.log('🔌 Setting up subject types subscription...');
    
    const channel = supabase
      .channel('subject_types_changes', {
        config: {
          broadcast: { self: true },
        },
      })
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subject_types',
        },
        (payload) => {
          console.log('📋 Subject type change detected:', {
            eventType: payload.eventType,
            subjectTypeId: (payload.new as any)?.id || (payload.old as any)?.id,
            timestamp: new Date().toISOString(),
          });

          if (payload.eventType === 'INSERT' && payload.new) {
            const newSubjectType = payload.new as any;
            
            setSubjectTypes((prev) => {
              const exists = prev.some((st) => st.id === newSubjectType.id);
              if (exists) {
                console.log('⚠️ Subject type already exists in list, skipping INSERT');
                return prev;
              }
              
              console.log('✅ Adding new subject type to list:', newSubjectType.id);
              const updated = [newSubjectType as SubjectType, ...prev];
              return updated.sort((a, b) => 
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
              );
            });
          } else if (payload.eventType === 'UPDATE' && payload.new) {
            const updatedSubjectType = payload.new as SubjectType;
            
            console.log('🔄 Processing UPDATE for subject type:', updatedSubjectType.id);
            
            setSubjectTypes((prev) => {
              const existingSubjectType = prev.find((st) => st.id === updatedSubjectType.id);
              
              if (!existingSubjectType) {
                console.log('➕ Subject type not in list, adding:', updatedSubjectType.id);
                const updated = [updatedSubjectType, ...prev];
                return updated.sort((a, b) => 
                  new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                );
              }
              
              console.log('✅ Updating existing subject type in list:', updatedSubjectType.id);
              const updated = prev.map((st) =>
                st.id === updatedSubjectType.id
                  ? updatedSubjectType
                  : st
              );
              return updated;
            });
          } else if (payload.eventType === 'DELETE' && payload.old) {
            const deletedSubjectType = payload.old as { id: string };
            
            console.log('🗑️ Processing DELETE for subject type:', deletedSubjectType.id);
            setSubjectTypes((prev) => {
              return prev.filter((st) => st.id !== deletedSubjectType.id);
            });
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Subject types subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('✅ Successfully subscribed to subject types changes');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Channel error - check Supabase real-time settings');
        } else if (status === 'TIMED_OUT') {
          console.error('❌ Subscription timed out - Realtime connection issue');
        } else if (status === 'CLOSED') {
          console.log('⚠️ Subscription closed');
        }
      });

    return () => {
      console.log('🧹 Cleaning up subject types subscription');
      supabase.removeChannel(channel);
    };
  }, []);

  const filterCategories: FilterCategory[] = [
    {
      label: "Status",
      options: [
        { value: "enabled", label: "Enabled" },
        { value: "disabled", label: "Disabled" },
      ],
    },
  ];

  const filteredAndSortedSubjectTypes = useMemo(() => {
    let filtered = subjectTypes;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (subjectType) =>
          subjectType.name.toLowerCase().includes(query) ||
          subjectType.label.toLowerCase().includes(query) ||
          (subjectType.description && subjectType.description.toLowerCase().includes(query))
      );
    }

    // Apply status filter
    const selectedStatuses = selectedFilters["Status"] || [];
    if (selectedStatuses.length > 0) {
      filtered = filtered.filter((subjectType) => {
        const status = subjectType.enabled ? "enabled" : "disabled";
        return selectedStatuses.includes(status);
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
      default:
        sorted.sort((a, b) => 
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        );
    }

    return sorted;
  }, [subjectTypes, searchQuery, selectedFilters, selectedSort]);

  const handleDelete = () => {
    router.refresh();
  };

  const handleEdit = (subjectType: SubjectType) => {
    setSelectedSubjectType(subjectType);
    setIsEditModalOpen(true);
  };

  const handleEditSuccess = (updatedSubjectType: SubjectType) => {
    setSelectedSubjectType(null);
    setIsEditModalOpen(false);
  };

  const handleFilterApply = (filters: Record<string, string[]>) => {
    setSelectedFilters(filters);
  };

  const handleFilterClear = () => {
    setSelectedFilters({
      Status: [],
    });
  };

  return (
    <div className="w-full space-y-6">
      <Toolbar
        searchPlaceholder="Search subject types..."
        onSearch={setSearchQuery}
        filterCategories={filterCategories}
        selectedFilters={selectedFilters}
        onFilterApply={handleFilterApply}
        onFilterClear={handleFilterClear}
        sortOptions={["Recent", "Name"]}
        onSortChange={setSelectedSort}
        selectedSort={selectedSort}
        primaryAction={{
          label: "New",
          onClick: () => setIsCreateModalOpen(true),
        }}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {filteredAndSortedSubjectTypes.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-xl border border-dashed border-border/60 bg-muted/30 p-8 text-center text-muted-foreground"
        >
          {subjectTypes.length === 0
            ? "No subject types. Create one to get started."
            : "No subject types found matching your search"}
        </motion.div>
      ) : viewMode === "grid" ? (
        <SubjectTypesGrid subjectTypes={filteredAndSortedSubjectTypes} onDelete={handleDelete} onEdit={handleEdit} />
      ) : (
        <SubjectTypesTable subjectTypes={filteredAndSortedSubjectTypes} onDelete={handleDelete} onEdit={handleEdit} />
      )}

      <SubjectTypeModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSuccess={() => {
          router.refresh();
        }}
      />

      <SubjectTypeModal
        open={isEditModalOpen}
        onOpenChange={(open) => {
          setIsEditModalOpen(open);
          if (!open) setSelectedSubjectType(null);
        }}
        initialData={selectedSubjectType}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
}


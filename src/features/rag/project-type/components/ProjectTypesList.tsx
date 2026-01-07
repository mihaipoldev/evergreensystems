"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { Toolbar, type ViewMode } from "@/features/rag/shared/components/Toolbar";
import { useViewMode } from "@/features/rag/shared/hooks/useViewMode";
import type { FilterCategory } from "@/features/rag/shared/components/RAGFilterMenu";
import { ProjectTypesGrid } from "./ProjectTypesGrid";
import { ProjectTypesTable } from "./ProjectTypesTable";
import { ProjectTypeModal } from "./ProjectTypeModal";
import type { ProjectType } from "../types";

type ProjectTypesListProps = {
  initialProjectTypes: ProjectType[];
};

const STORAGE_KEY_PREFIX = "project-types-";
const STORAGE_KEY_SEARCH = `${STORAGE_KEY_PREFIX}search`;
const STORAGE_KEY_FILTERS = `${STORAGE_KEY_PREFIX}filters`;
const STORAGE_KEY_SORT = `${STORAGE_KEY_PREFIX}sort`;

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
  if (typeof window === "undefined") return { Status: [] };
  try {
    const stored = localStorage.getItem(STORAGE_KEY_FILTERS);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed && typeof parsed === "object" ? parsed : { Status: [] };
    }
  } catch {
    // Ignore parse errors
  }
  return { Status: [] };
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

export function ProjectTypesList({ initialProjectTypes }: ProjectTypesListProps) {
  const router = useRouter();
  const [viewMode, setViewMode] = useViewMode("grid");
  const [projectTypes, setProjectTypes] = useState<ProjectType[]>(initialProjectTypes);
  // Initialize state from localStorage directly to avoid flash of default values
  const [searchQuery, setSearchQuery] = useState(() => getStoredSearch());
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>(() => getStoredFilters());
  const [selectedSort, setSelectedSort] = useState(() => getStoredSort());
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProjectType, setSelectedProjectType] = useState<ProjectType | null>(null);
  const hasLoadedFromStorage = useRef(false);

  // Mark as loaded after first render
  useEffect(() => {
    hasLoadedFromStorage.current = true;
  }, []);

  // Update project types when initialProjectTypes changes
  useEffect(() => {
    setProjectTypes(initialProjectTypes);
  }, [initialProjectTypes]);

  // Set up Supabase real-time subscription for project types
  useEffect(() => {
    const supabase = createClient();
    
    console.log('🔌 Setting up project types subscription...');
    
    const channel = supabase
      .channel('project_types_changes', {
        config: {
          broadcast: { self: true },
        },
      })
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'project_types',
        },
        (payload) => {
          console.log('📋 Project type change detected:', {
            eventType: payload.eventType,
            projectTypeId: (payload.new as any)?.id || (payload.old as any)?.id,
            timestamp: new Date().toISOString(),
          });

          if (payload.eventType === 'INSERT' && payload.new) {
            const newProjectType = payload.new as any;
            
            setProjectTypes((prev) => {
              const exists = prev.some((pt) => pt.id === newProjectType.id);
              if (exists) {
                console.log('⚠️ Project type already exists in list, skipping INSERT');
                return prev;
              }
              
              console.log('✅ Adding new project type to list:', newProjectType.id);
              const updated = [newProjectType as ProjectType, ...prev];
              return updated.sort((a, b) => 
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
              );
            });
          } else if (payload.eventType === 'UPDATE' && payload.new) {
            const updatedProjectType = payload.new as ProjectType;
            
            console.log('🔄 Processing UPDATE for project type:', updatedProjectType.id);
            
            setProjectTypes((prev) => {
              const existingProjectType = prev.find((pt) => pt.id === updatedProjectType.id);
              
              if (!existingProjectType) {
                console.log('➕ Project type not in list, adding:', updatedProjectType.id);
                const updated = [updatedProjectType, ...prev];
                return updated.sort((a, b) => 
                  new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                );
              }
              
              console.log('✅ Updating existing project type in list:', updatedProjectType.id);
              const updated = prev.map((pt) =>
                pt.id === updatedProjectType.id
                  ? updatedProjectType
                  : pt
              );
              return updated;
            });
          } else if (payload.eventType === 'DELETE' && payload.old) {
            const deletedProjectType = payload.old as { id: string };
            
            console.log('🗑️ Processing DELETE for project type:', deletedProjectType.id);
            setProjectTypes((prev) => {
              return prev.filter((pt) => pt.id !== deletedProjectType.id);
            });
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Project types subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('✅ Successfully subscribed to project types changes');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Channel error - check Supabase real-time settings');
        } else if (status === 'TIMED_OUT') {
          console.error('❌ Subscription timed out - Realtime connection issue');
        } else if (status === 'CLOSED') {
          console.log('⚠️ Subscription closed');
        }
      });

    return () => {
      console.log('🧹 Cleaning up project types subscription');
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

  const filteredAndSortedProjectTypes = useMemo(() => {
    let filtered = projectTypes;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (projectType) =>
          projectType.name.toLowerCase().includes(query) ||
          projectType.label.toLowerCase().includes(query) ||
          (projectType.description && projectType.description.toLowerCase().includes(query))
      );
    }

    // Apply status filter
    const selectedStatuses = selectedFilters["Status"] || [];
    if (selectedStatuses.length > 0) {
      filtered = filtered.filter((projectType) => {
        const status = projectType.enabled ? "enabled" : "disabled";
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
  }, [projectTypes, searchQuery, selectedFilters, selectedSort]);

  const handleDelete = () => {
    router.refresh();
  };

  const handleEdit = (projectType: ProjectType) => {
    setSelectedProjectType(projectType);
    setIsEditModalOpen(true);
  };

  const handleEditSuccess = (updatedProjectType: ProjectType) => {
    setSelectedProjectType(null);
    setIsEditModalOpen(false);
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

  const handleFilterApply = (filters: Record<string, string[]>) => {
    setSelectedFilters(filters);
  };

  const handleFilterClear = () => {
    const clearedFilters = {
      Status: [],
    };
    setSelectedFilters(clearedFilters);
  };

  return (
    <div className="w-full space-y-6">
      <Toolbar
        searchPlaceholder="Search project types..."
        searchValue={searchQuery}
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

      {filteredAndSortedProjectTypes.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-xl border border-dashed border-border/60 bg-muted/30 p-8 text-center text-muted-foreground"
        >
          {projectTypes.length === 0
            ? "No project types. Create one to get started."
            : "No project types found matching your search"}
        </motion.div>
      ) : viewMode === "grid" ? (
        <ProjectTypesGrid projectTypes={filteredAndSortedProjectTypes} onDelete={handleDelete} onEdit={handleEdit} />
      ) : (
        <ProjectTypesTable projectTypes={filteredAndSortedProjectTypes} onDelete={handleDelete} onEdit={handleEdit} />
      )}

      <ProjectTypeModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSuccess={() => {
          router.refresh();
        }}
      />

      <ProjectTypeModal
        open={isEditModalOpen}
        onOpenChange={(open) => {
          setIsEditModalOpen(open);
          if (!open) setSelectedProjectType(null);
        }}
        initialData={selectedProjectType}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
}


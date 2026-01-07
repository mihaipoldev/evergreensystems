"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { Toolbar, type ViewMode } from "@/features/rag/shared/components/Toolbar";
import { useViewMode } from "@/features/rag/shared/hooks/useViewMode";
import type { FilterCategory } from "@/features/rag/shared/components/RAGFilterMenu";
import { ProjectGrid } from "./ProjectGrid";
import { ProjectTable } from "./ProjectTable";
import { ProjectModal } from "./ProjectModal";
import type { Project } from "../types";
import type { ProjectType } from "@/features/rag/project-type/types";

type ProjectWithCount = Project & { document_count?: number };

type ProjectListProps = {
  initialProjects: ProjectWithCount[];
};

const STORAGE_KEY_PREFIX = "projects-";
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
  if (typeof window === "undefined") return { Status: [], "Client Name": [], "Project Type": [] };
  try {
    const stored = localStorage.getItem(STORAGE_KEY_FILTERS);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed && typeof parsed === "object" ? parsed : { Status: [], "Client Name": [], "Project Type": [] };
    }
  } catch {
    // Ignore parse errors
  }
  return { Status: [], "Client Name": [], "Project Type": [] };
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

export function ProjectList({ initialProjects }: ProjectListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [viewMode, setViewMode] = useViewMode("grid");
  // Initialize state from localStorage directly to avoid flash of default values
  const [searchQuery, setSearchQuery] = useState(() => getStoredSearch());
  // Initialize filters from localStorage - URL params will override in useEffect
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>(() => getStoredFilters());
  const [selectedSort, setSelectedSort] = useState(() => getStoredSort());
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projectTypes, setProjectTypes] = useState<ProjectType[]>([]);
  const hasLoadedFromStorage = useRef(false);

  // Mark as loaded after first render
  useEffect(() => {
    hasLoadedFromStorage.current = true;
  }, []);

  // Fetch project types
  useEffect(() => {
    const loadProjectTypes = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("project_types")
          .select("*")
          .eq("enabled", true)
          .order("name", { ascending: true });

        if (error) {
          console.error("Error loading project types:", error);
          return;
        }

        setProjectTypes((data || []) as ProjectType[]);
      } catch (error) {
        console.error("Error loading project types:", error);
      }
    };
    loadProjectTypes();
  }, []);

  // Track whether Project Type filter came from URL param (should not be persisted)
  const projectTypeFromUrlRef = useRef<boolean>(false);

  // Sync filter state with URL params (overrides persisted filter when project type is clicked)
  useEffect(() => {
    const projectTypeId = searchParams.get("project_type_id");
    
    if (projectTypeId) {
      // URL param takes precedence - override persisted filter
      // Mark that this came from URL so we don't persist it
      projectTypeFromUrlRef.current = true;
      setSelectedFilters(prev => ({
        ...prev,
        "Project Type": [projectTypeId],
      }));
    } else {
      // No URL param - if we previously had one from URL, clear the filter
      if (projectTypeFromUrlRef.current) {
        setSelectedFilters(prev => ({
          ...prev,
          "Project Type": [],
        }));
        projectTypeFromUrlRef.current = false;
      } else if (!hasLoadedFromStorage.current) {
        // Initial load with no URL param - use persisted filter
        const stored = getStoredFilters();
        setSelectedFilters(prev => ({
          ...prev,
          "Project Type": stored["Project Type"] || [],
        }));
      }
    }
  }, [searchParams]);

  // Get unique client names for filter
  const uniqueClientNames = useMemo(() => {
    const names = new Set(initialProjects.map(p => p.client_name).filter((name): name is string => Boolean(name)));
    return Array.from(names).sort();
  }, [initialProjects]);

  const filterCategories: FilterCategory[] = [
    {
      label: "Project Type",
      options: projectTypes.map(pt => ({ 
        value: pt.id, 
        label: pt.label || pt.name 
      })),
    },
    {
      label: "Status",
      options: [
        { value: "active", label: "Active" },
        { value: "onboarding", label: "Onboarding" },
        { value: "delivered", label: "Delivered" },
        { value: "archived", label: "Archived" },
      ],
    },
    {
      label: "Client Name",
      options: uniqueClientNames.map(name => ({ value: name, label: name })),
    },
  ];

  const filteredAndSortedProjects = useMemo(() => {
    let filtered = initialProjects;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (project) =>
          (project.client_name && project.client_name.toLowerCase().includes(query)) ||
          (project.description &&
            project.description.toLowerCase().includes(query))
      );
    }

    // Apply status filter
    const selectedStatuses = selectedFilters["Status"] || [];
    if (selectedStatuses.length > 0) {
      filtered = filtered.filter((project) =>
        selectedStatuses.includes(project.status)
      );
    }

    // Apply client name filter
    const selectedClientNames = selectedFilters["Client Name"] || [];
    if (selectedClientNames.length > 0) {
      filtered = filtered.filter((project) =>
        project.client_name && selectedClientNames.includes(project.client_name)
      );
    }

    // Apply project type filter
    const selectedProjectTypeIds = selectedFilters["Project Type"] || [];
    if (selectedProjectTypeIds.length > 0) {
      filtered = filtered.filter((project) =>
        project.project_type_id && selectedProjectTypeIds.includes(project.project_type_id)
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
        sorted.sort((a, b) => (a.client_name || "").localeCompare(b.client_name || ""));
        break;
      default:
        sorted.sort((a, b) => 
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        );
    }

    return sorted;
  }, [initialProjects, searchQuery, selectedFilters, selectedSort]);

  const handleDelete = () => {
    router.refresh();
  };

  const handleEdit = (project: Project) => {
    setSelectedProject(project);
    setIsEditModalOpen(true);
  };

  const handleEditSuccess = () => {
    setIsEditModalOpen(false);
    setSelectedProject(null);
    router.refresh();
  };

  // Persist search query changes (only after initial load)
  useEffect(() => {
    if (hasLoadedFromStorage.current) {
      setStoredSearch(searchQuery);
    }
  }, [searchQuery]);

  // Persist filter changes (only after initial load)
  // Note: Don't persist Project Type filter if it came from URL param
  useEffect(() => {
    if (hasLoadedFromStorage.current) {
      // If Project Type filter came from URL, exclude it from persistence
      // and use the persisted value instead (or empty array)
      const filtersToPersist = projectTypeFromUrlRef.current
        ? {
            ...selectedFilters,
            "Project Type": getStoredFilters()["Project Type"] || [],
          }
        : selectedFilters;
      setStoredFilters(filtersToPersist);
    }
  }, [selectedFilters]);

  // Persist sort changes (only after initial load)
  useEffect(() => {
    if (hasLoadedFromStorage.current) {
      setStoredSort(selectedSort);
    }
  }, [selectedSort]);

  const handleFilterApply = (filters: Record<string, string[]>) => {
    // When user manually applies filters, mark that Project Type is no longer from URL
    projectTypeFromUrlRef.current = false;
    setSelectedFilters(filters);
  };

  const handleFilterClear = () => {
    // Mark that this is a manual action, not from URL
    projectTypeFromUrlRef.current = false;
    const clearedFilters = {
      Status: [],
      "Client Name": [],
      "Project Type": [],
    };
    setSelectedFilters(clearedFilters);
  };

  return (
    <div className="w-full space-y-6">
      <Toolbar
        searchPlaceholder="Search projects..."
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

      {filteredAndSortedProjects.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-xl border border-dashed border-border/60 bg-muted/30 p-8 text-center text-muted-foreground"
        >
          {initialProjects.length === 0
            ? "No projects. Create one to get started."
            : "No projects found matching your search"}
        </motion.div>
      ) : viewMode === "grid" ? (
        <ProjectGrid 
          projects={filteredAndSortedProjects}
          projectTypes={projectTypes}
          onDelete={handleDelete}
          onEdit={handleEdit}
        />
      ) : (
        <ProjectTable 
          projects={filteredAndSortedProjects}
          projectTypes={projectTypes}
          onDelete={handleDelete}
          onEdit={handleEdit}
        />
      )}

      <ProjectModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSuccess={() => {
          router.refresh();
        }}
      />

      <ProjectModal
        open={isEditModalOpen}
        onOpenChange={(open) => {
          setIsEditModalOpen(open);
          if (!open) {
            setSelectedProject(null);
          }
        }}
        initialData={selectedProject || undefined}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
}

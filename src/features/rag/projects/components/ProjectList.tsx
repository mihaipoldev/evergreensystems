"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { usePageHeader } from "@/providers/PageHeaderProvider";
import { Toolbar } from "@/features/rag/shared/components/Toolbar";
import type { FilterCategory } from "@/features/rag/shared/components/RAGFilterMenu";
import { ProjectTable } from "./ProjectTable";
import { ProjectModal } from "./ProjectModal";
import { BulkSelectionProvider, useBulkSelection } from "@/features/rag/shared/contexts/BulkSelectionContext";
import { FloatingActionBar } from "@/features/rag/shared/components/FloatingActionBar";
import { DeleteConfirmationDialog } from "@/features/rag/shared/components/DeleteConfirmationDialog";
import { BulkGenerateReportModal } from "@/features/rag/workflows/components/BulkGenerateReportModal";
import { ActionMenu } from "@/components/shared/ActionMenu";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsis, faFileExport } from "@fortawesome/free-solid-svg-icons";
import { toast } from "sonner";
import type { Project } from "../types";
import type { ProjectType } from "@/features/rag/project-type/types";
import { useProjectTypes } from "../hooks/useProjectTypes";

type ProjectWithCount = Project & { document_count?: number };

type ProjectListProps = {
  initialProjects: ProjectWithCount[];
};

const STORAGE_KEY_PREFIX = "projects-";
const STORAGE_KEY_SEARCH = `${STORAGE_KEY_PREFIX}search`;
const STORAGE_KEY_FILTERS = `${STORAGE_KEY_PREFIX}filters`;
const STORAGE_KEY_SORT = `${STORAGE_KEY_PREFIX}sort`;
const STORAGE_KEY_GROUP_BY_VERDICT = "projects-group-by-verdict";

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
  if (typeof window === "undefined") return { "Project Type": [] };
  try {
    const stored = localStorage.getItem(STORAGE_KEY_FILTERS);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed && typeof parsed === "object" ? parsed : { "Project Type": [] };
    }
  } catch {
    // Ignore parse errors
  }
  return { "Project Type": [] };
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

function getStoredGroupByVerdict(): string {
  if (typeof window === "undefined") return "none";
  try {
    const saved = localStorage.getItem(STORAGE_KEY_GROUP_BY_VERDICT);
    if (saved === "true") {
      // Migrate from old boolean format
      localStorage.setItem(STORAGE_KEY_GROUP_BY_VERDICT, "verdict");
      return "verdict";
    }
    if (saved === "false") {
      localStorage.setItem(STORAGE_KEY_GROUP_BY_VERDICT, "none");
      return "none";
    }
    return saved || "none";
  } catch {
    return "none";
  }
}

function setStoredGroupByVerdict(value: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_GROUP_BY_VERDICT, value);
  } catch {
    // Ignore localStorage errors
  }
}

// Inner component that uses bulk selection context
function ProjectListContent({ initialProjects }: ProjectListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Initialize state from localStorage directly to avoid flash of default values
  const [searchQuery, setSearchQuery] = useState(() => getStoredSearch());
  // Initialize filters from localStorage - URL params will override in useEffect
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>(() => getStoredFilters());
  const [selectedSort, setSelectedSort] = useState(() => getStoredSort());
  const [groupByVerdict, setGroupByVerdict] = useState(() => getStoredGroupByVerdict());
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const { data: projectTypes = [] } = useProjectTypes();
  const hasLoadedFromStorage = useRef(false);
  
  // Bulk selection state
  const { selectedIds, clearSelection, getSelectedCount } = useBulkSelection();
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [showBulkGenerateModal, setShowBulkGenerateModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Mark as loaded after first render
  useEffect(() => {
    hasLoadedFromStorage.current = true;
  }, []);

  const { setHeader } = usePageHeader();

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

  // Get the selected project type name
  const selectedProjectTypeId = selectedFilters["Project Type"]?.[0];
  const selectedProjectType = projectTypes.find(pt => pt.id === selectedProjectTypeId);
  const projectTypeName = selectedProjectType?.name || null;

  // Conditional filter categories based on project type
  const filterCategories: FilterCategory[] = useMemo(() => {
    const baseCategories: FilterCategory[] = [
      {
        label: "Project Type",
        options: projectTypes.map(pt => ({ 
          value: pt.id, 
          label: pt.label || pt.name 
        })),
      },
    ];

    if (projectTypeName === "niche") {
      // For niche projects: Project Type + Verdict
      return [
        ...baseCategories,
        {
          label: "Verdict",
          options: [
            { value: "ideal", label: "Ideal" },
            { value: "pursue", label: "Pursue" },
            { value: "test", label: "Test" },
            { value: "avoid", label: "Avoid" },
          ],
        },
      ];
    } else {
      // For other projects: Project Type + Status + Client Name
      return [
        ...baseCategories,
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
    }
  }, [projectTypes, projectTypeName, uniqueClientNames]);

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

    // Apply project type filter
    const selectedProjectTypeIds = selectedFilters["Project Type"] || [];
    if (selectedProjectTypeIds.length > 0) {
      filtered = filtered.filter((project) =>
        project.project_type_id && selectedProjectTypeIds.includes(project.project_type_id)
      );
    }

    // Conditional filters based on project type
    if (projectTypeName === "niche") {
      // For niche projects: apply verdict filter
      const selectedVerdicts = selectedFilters["Verdict"] || [];
      if (selectedVerdicts.length > 0) {
        filtered = filtered.filter((project) => {
          const verdict = (project as any).niche_intelligence_verdict;
          // Handle "ideal" as a special case - pursue with high fit score (>= 80)
          if (selectedVerdicts.includes("ideal")) {
            const fitScore = (project as any).niche_intelligence_fit_score;
            if (verdict === "pursue" && fitScore !== null && fitScore >= 80) {
              return true;
            }
          }
          return verdict && selectedVerdicts.includes(verdict);
        });
      }
    } else {
      // For other projects: apply status and client name filters
      const selectedStatuses = selectedFilters["Status"] || [];
      if (selectedStatuses.length > 0) {
        filtered = filtered.filter((project) =>
          selectedStatuses.includes(project.status)
        );
      }

      const selectedClientNames = selectedFilters["Client Name"] || [];
      if (selectedClientNames.length > 0) {
        filtered = filtered.filter((project) =>
          project.client_name && selectedClientNames.includes(project.client_name)
        );
      }
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
      case "Fit Score":
        sorted.sort((a, b) => {
          const scoreA = (a as any).niche_intelligence_fit_score ?? -1;
          const scoreB = (b as any).niche_intelligence_fit_score ?? -1;
          // Sort descending (highest score first), nulls go to end
          if (scoreA === -1 && scoreB === -1) return 0;
          if (scoreA === -1) return 1;
          if (scoreB === -1) return -1;
          return scoreB - scoreA;
        });
        break;
      default:
        sorted.sort((a, b) => 
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        );
    }

    return sorted;
  }, [initialProjects, searchQuery, selectedFilters, selectedSort, projectTypeName, projectTypes]);

  const handleExportVisibleNames = useCallback(() => {
    const names = filteredAndSortedProjects.map((p) => p.name);
    if (names.length === 0) {
      toast.info("No project names to export");
      return;
    }
    const blob = new Blob([names.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `project-names-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${names.length} project name(s)`);
  }, [filteredAndSortedProjects]);

  useEffect(() => {
    setHeader({
      breadcrumbItems: [{ label: "Projects" }],
      actions: (
        <ActionMenu
          trigger={
            <button
              onClick={(e) => e.stopPropagation()}
              className="h-9 w-9 rounded-full hover:text-primary flex items-center justify-center shrink-0 cursor-pointer transition-all"
            >
              <FontAwesomeIcon icon={faEllipsis} className="h-4 w-4" />
            </button>
          }
          items={[
            {
              label: "Export all visible names",
              icon: <FontAwesomeIcon icon={faFileExport} className="h-4 w-4" />,
              onClick: handleExportVisibleNames,
            },
          ]}
          align="end"
        />
      ),
    });
    return () => setHeader(null);
  }, [setHeader, handleExportVisibleNames]);

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

  // Persist groupByVerdict changes (only after initial load)
  useEffect(() => {
    if (hasLoadedFromStorage.current) {
      setStoredGroupByVerdict(groupByVerdict);
    }
  }, [groupByVerdict]);

  const handleFilterApply = (filters: Record<string, string[]>) => {
    // When user manually applies filters, mark that Project Type is no longer from URL
    projectTypeFromUrlRef.current = false;
    setSelectedFilters(filters);
  };

  const handleFilterClear = () => {
    // Mark that this is a manual action, not from URL
    projectTypeFromUrlRef.current = false;
    const clearedFilters: Record<string, string[]> = {
      "Project Type": [],
    };
    
    // Clear filters based on current project type
    if (projectTypeName === "niche") {
      clearedFilters["Verdict"] = [];
    } else {
      clearedFilters["Status"] = [];
      clearedFilters["Client Name"] = [];
    }
    
    setSelectedFilters(clearedFilters);
  };

  const handleBulkDelete = async () => {
    if (isDeleting) return;

    setIsDeleting(true);
    try {
      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      const selectedIdsArray = Array.from(selectedIds);
      const deletePromises = selectedIdsArray.map(id =>
        fetch(`/api/intel/projects/${id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          },
        })
      );

      const results = await Promise.all(deletePromises);
      const errors = results.filter(r => !r.ok);
      
      if (errors.length > 0) {
        throw new Error(`Failed to delete ${errors.length} project(s)`);
      }

      toast.success(`Deleted ${selectedIdsArray.length} project(s) successfully`);
      setShowBulkDeleteDialog(false);
      clearSelection();
      router.refresh();
    } catch (error: any) {
      console.error("Error deleting projects:", error);
      toast.error(error.message || "Failed to delete projects");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBulkGenerate = () => {
    setShowBulkGenerateModal(true);
  };

  const handleBulkGenerateComplete = () => {
    setShowBulkGenerateModal(false);
    clearSelection();
    router.refresh();
  };

  // Get selected projects data
  const selectedProjectsData = useMemo(() => {
    return filteredAndSortedProjects.filter((project) =>
      selectedIds.has(project.id)
    );
  }, [filteredAndSortedProjects, selectedIds]);

  return (
    <div className="w-full space-y-4">
      <Toolbar
        searchPlaceholder="Search projects..."
        searchValue={searchQuery}
        onSearch={setSearchQuery}
          filterCategories={filterCategories}
          selectedFilters={selectedFilters}
          onFilterApply={handleFilterApply}
          onFilterClear={handleFilterClear}
          sortOptions={projectTypeName === "niche" ? ["Recent", "Name", "Fit Score"] : ["Recent", "Name"]}
          onSortChange={setSelectedSort}
          selectedSort={selectedSort}
          primaryAction={{
            label: "New",
            onClick: () => setIsCreateModalOpen(true),
          }}
          groupByVerdict={projectTypeName === "niche" ? {
            options: [
              { value: "none", label: "None" },
              { value: "verdict", label: "Verdict" },
            ],
            selectedValue: groupByVerdict,
            onSelect: (value: string) => {
              setGroupByVerdict(value);
            },
          } : undefined}
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
      ) : (
        <ProjectTable 
          projects={filteredAndSortedProjects}
          projectTypes={projectTypes}
          projectTypeName={projectTypeName}
          groupByVerdict={projectTypeName === "niche" ? groupByVerdict !== "none" : false}
          onDelete={handleDelete}
          onEdit={handleEdit}
        />
      )}

      <ProjectModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        initialProjectTypeId={projectTypeName === "niche" ? (selectedProjectTypeId ?? undefined) : undefined}
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

      <FloatingActionBar
        selectedCount={getSelectedCount()}
        onGenerate={handleBulkGenerate}
        onDelete={() => setShowBulkDeleteDialog(true)}
        onClear={clearSelection}
      />

      <DeleteConfirmationDialog
        open={showBulkDeleteDialog}
        onOpenChange={setShowBulkDeleteDialog}
        entityName={`${selectedIds.size} project(s)`}
        entityType="projects"
        onConfirm={handleBulkDelete}
        isDeleting={isDeleting}
      />

      <BulkGenerateReportModal
        open={showBulkGenerateModal}
        onOpenChange={setShowBulkGenerateModal}
        selectedProjects={selectedProjectsData}
        projectType={projectTypeName}
        projectTypeId={selectedProjectTypeId || undefined}
        onComplete={handleBulkGenerateComplete}
      />
    </div>
  );
}

export function ProjectList({ initialProjects }: ProjectListProps) {
  return (
    <BulkSelectionProvider>
      <ProjectListContent initialProjects={initialProjects} />
    </BulkSelectionProvider>
  );
}

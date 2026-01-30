"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Toolbar } from "@/features/rag/shared/components/Toolbar";
import type { FilterCategory } from "@/features/rag/shared/components/RAGFilterMenu";
import { WorkflowTable } from "./WorkflowTable";
import { WorkflowModal } from "./WorkflowModal";
import type { Workflow } from "../types";

type WorkflowListProps = {
  initialWorkflows: Workflow[];
};

const STORAGE_KEY_PREFIX = "workflows-";
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

export function WorkflowList({ initialWorkflows }: WorkflowListProps) {
  const router = useRouter();
  // Initialize state from localStorage directly to avoid flash of default values
  const [searchQuery, setSearchQuery] = useState(() => getStoredSearch());
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>(() => getStoredFilters());
  const [selectedSort, setSelectedSort] = useState(() => getStoredSort());
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState<Workflow | null>(null);
  const hasLoadedFromStorage = useRef(false);

  // Mark as loaded after first render
  useEffect(() => {
    hasLoadedFromStorage.current = true;
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

  const filteredAndSortedWorkflows = useMemo(() => {
    let filtered = initialWorkflows;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (workflow) =>
          workflow.slug.toLowerCase().includes(query) ||
          workflow.name.toLowerCase().includes(query) ||
          (workflow.description &&
            workflow.description.toLowerCase().includes(query))
      );
    }

    // Apply status filter
    const selectedStatuses = selectedFilters["Status"] || [];
    if (selectedStatuses.length > 0) {
      filtered = filtered.filter((workflow) => {
        const status = workflow.enabled ? "enabled" : "disabled";
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
  }, [initialWorkflows, searchQuery, selectedFilters, selectedSort]);

  const handleDelete = () => {
    router.refresh();
  };

  const handleEdit = (workflow: Workflow) => {
    setEditingWorkflow(workflow);
  };

  const handleEditSuccess = () => {
    setEditingWorkflow(null);
    router.refresh();
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
    <div className="w-full space-y-3">
      <Toolbar
        searchPlaceholder="Search workflows..."
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
        />

      {filteredAndSortedWorkflows.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-xl border border-dashed border-border/60 bg-muted/30 p-8 text-center text-muted-foreground"
        >
          {initialWorkflows.length === 0
            ? "No workflows. Create one to get started."
            : "No workflows found matching your search"}
        </motion.div>
      ) : (
        <WorkflowTable workflows={filteredAndSortedWorkflows} onDelete={handleDelete} onEdit={handleEdit} />
      )}

      <WorkflowModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSuccess={() => {
          router.refresh();
        }}
      />

      <WorkflowModal
        open={!!editingWorkflow}
        onOpenChange={(open) => {
          if (!open) setEditingWorkflow(null);
        }}
        initialData={editingWorkflow}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
}


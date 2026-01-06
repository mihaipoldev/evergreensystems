"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Toolbar, type ViewMode } from "@/features/rag/shared/components/Toolbar";
import { useViewMode } from "@/features/rag/shared/hooks/useViewMode";
import type { FilterCategory } from "@/features/rag/shared/components/RAGFilterMenu";
import { WorkflowGrid } from "./WorkflowGrid";
import { WorkflowTable } from "./WorkflowTable";
import { WorkflowModal } from "./WorkflowModal";
import type { Workflow } from "../types";

type WorkflowListProps = {
  initialWorkflows: Workflow[];
};

export function WorkflowList({ initialWorkflows }: WorkflowListProps) {
  const router = useRouter();
  const [viewMode, setViewMode] = useViewMode("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({
    Status: [],
  });
  const [selectedSort, setSelectedSort] = useState("Recent");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState<Workflow | null>(null);

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
          workflow.name.toLowerCase().includes(query) ||
          workflow.label.toLowerCase().includes(query) ||
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
        sorted.sort((a, b) => a.label.localeCompare(b.label));
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
        searchPlaceholder="Search workflows..."
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
      ) : viewMode === "grid" ? (
        <WorkflowGrid workflows={filteredAndSortedWorkflows} onDelete={handleDelete} onEdit={handleEdit} />
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


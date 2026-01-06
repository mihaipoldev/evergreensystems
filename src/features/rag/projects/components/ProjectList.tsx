"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Toolbar, type ViewMode } from "@/features/rag/shared/components/Toolbar";
import { useViewMode } from "@/features/rag/shared/hooks/useViewMode";
import type { FilterCategory } from "@/features/rag/shared/components/RAGFilterMenu";
import { ProjectGrid } from "./ProjectGrid";
import { ProjectTable } from "./ProjectTable";
import { ProjectModal } from "./ProjectModal";
import type { Project } from "../types";

type ProjectWithCount = Project & { document_count?: number };

type ProjectListProps = {
  initialProjects: ProjectWithCount[];
};

export function ProjectList({ initialProjects }: ProjectListProps) {
  const router = useRouter();
  const [viewMode, setViewMode] = useViewMode("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({
    Status: [],
    "Client Name": [],
  });
  const [selectedSort, setSelectedSort] = useState("Recent");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Get unique client names for filter
  const uniqueClientNames = useMemo(() => {
    const names = new Set(initialProjects.map(p => p.client_name).filter(Boolean));
    return Array.from(names).sort();
  }, [initialProjects]);

  const filterCategories: FilterCategory[] = [
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
          project.client_name.toLowerCase().includes(query) ||
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
        selectedClientNames.includes(project.client_name)
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
        sorted.sort((a, b) => a.client_name.localeCompare(b.client_name));
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

  const handleFilterApply = (filters: Record<string, string[]>) => {
    setSelectedFilters(filters);
  };

  const handleFilterClear = () => {
    setSelectedFilters({
      Status: [],
      "Client Name": [],
    });
  };

  return (
    <div className="w-full space-y-6">
      <Toolbar
        searchPlaceholder="Search projects..."
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
        <ProjectGrid projects={filteredAndSortedProjects} onDelete={handleDelete} />
      ) : (
        <ProjectTable projects={filteredAndSortedProjects} onDelete={handleDelete} />
      )}

      <ProjectModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSuccess={() => {
          router.refresh();
        }}
      />
    </div>
  );
}

"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Toolbar, type ViewMode } from "@/features/rag/shared/components/Toolbar";
import { useViewMode } from "@/features/rag/shared/hooks/useViewMode";
import type { FilterCategory } from "@/features/rag/shared/components/RAGFilterMenu";
import { ProjectGrid } from "./ProjectGrid";
import { ProjectTable } from "./ProjectTable";
import { ProjectModal } from "./ProjectModal";
import type { Project } from "../types";
import { Input } from "@/components/ui/input";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";

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
            placeholder="Search projects..."
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
      </div>

      {filteredAndSortedProjects.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/60 bg-muted/30 p-8 text-center text-muted-foreground">
          {initialProjects.length === 0
            ? "No projects. Create one to get started."
            : "No projects found matching your search"}
        </div>
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

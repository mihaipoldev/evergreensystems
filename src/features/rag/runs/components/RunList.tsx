"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { Toolbar, type ViewMode } from "@/features/rag/shared/components/Toolbar";
import { useViewMode } from "@/features/rag/shared/hooks/useViewMode";
import type { FilterCategory } from "@/features/rag/shared/components/RAGFilterMenu";
import { RunTable } from "./RunTable";
import type { Run } from "../types";

type RunWithKB = Run & { knowledge_base_name?: string | null };

type RunListProps = {
  initialRuns: RunWithKB[];
};

export function RunList({ initialRuns }: RunListProps) {
  const router = useRouter();
  const [viewMode, setViewMode] = useViewMode("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({
    "Run Type": [],
    "Status": [],
  });
  const [selectedSort, setSelectedSort] = useState<string>("Recent");

  const filterCategories: FilterCategory[] = [
    {
      label: "Run Type",
      options: [
        { value: "niche_intelligence", label: "Niche Intelligence" },
        { value: "kb_query", label: "KB Query" },
        { value: "doc_ingest", label: "Document Ingest" },
      ],
    },
    {
      label: "Status",
      options: [
        { value: "queued", label: "Queued" },
        { value: "collecting", label: "Collecting" },
        { value: "ingesting", label: "Ingesting" },
        { value: "generating", label: "Generating" },
        { value: "complete", label: "Complete" },
        { value: "failed", label: "Failed" },
      ],
    },
  ];

  const filteredAndSortedRuns = useMemo(() => {
    let filtered = initialRuns;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (run) =>
          run.knowledge_base_name?.toLowerCase().includes(query) ||
          run.run_type.toLowerCase().includes(query) ||
          run.status.toLowerCase().includes(query)
      );
    }

    // Apply run type filter
    const selectedRunTypes = selectedFilters["Run Type"] || [];
    if (selectedRunTypes.length > 0) {
      filtered = filtered.filter((run) => {
        return selectedRunTypes.includes(run.run_type);
      });
    }

    // Apply status filter
    const selectedStatuses = selectedFilters["Status"] || [];
    if (selectedStatuses.length > 0) {
      filtered = filtered.filter((run) => {
        return selectedStatuses.includes(run.status);
      });
    }

    // Apply sorting
    const sorted = [...filtered];
    switch (selectedSort) {
      case "Recent":
        sorted.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        break;
      case "Knowledge Base":
        sorted.sort((a, b) => {
          const aName = a.knowledge_base_name || "";
          const bName = b.knowledge_base_name || "";
          return aName.localeCompare(bName);
        });
        break;
      default:
        // Default to Recent
        sorted.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
    }

    return sorted;
  }, [initialRuns, searchQuery, selectedFilters, selectedSort]);

  const handleFilterApply = (filters: Record<string, string[]>) => {
    setSelectedFilters(filters);
  };

  const handleFilterClear = () => {
    setSelectedFilters({
      "Run Type": [],
      "Status": [],
    });
  };

  const sortOptions = ["Recent", "Knowledge Base"];

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
            placeholder="Search runs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-10 bg-muted/20 shadow-buttons border-0 border-foreground/70"
          />
        </div>

        {/* Right: Filter + Sort + View Toggle */}
        <Toolbar
          searchPlaceholder=""
          onSearch={undefined}
          filterCategories={filterCategories}
          selectedFilters={selectedFilters}
          onFilterApply={handleFilterApply}
          onFilterClear={handleFilterClear}
          sortOptions={sortOptions}
          selectedSort={selectedSort}
          onSortChange={setSelectedSort}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />
      </div>

      {filteredAndSortedRuns.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/60 bg-muted/30 p-8 text-center text-muted-foreground">
          {initialRuns.length === 0
            ? "No runs found."
            : "No runs found matching your search"}
        </div>
      ) : (
        <RunTable runs={filteredAndSortedRuns} />
      )}
    </div>
  );
}

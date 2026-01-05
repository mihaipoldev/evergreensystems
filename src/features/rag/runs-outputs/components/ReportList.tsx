"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Toolbar, type ViewMode } from "@/features/rag/shared/components/Toolbar";
import { useViewMode } from "@/features/rag/shared/hooks/useViewMode";
import { ReportTable } from "./ReportTable";
import type { RunOutput } from "../types";

type ReportWithRun = RunOutput & {
  run?: {
    id: string;
    run_type: string;
    status: string;
    knowledge_base_name?: string | null;
    created_at: string;
  } | null;
};

type ReportListProps = {
  initialReports: ReportWithRun[];
};

export function ReportList({ initialReports }: ReportListProps) {
  const router = useRouter();
  const [viewMode, setViewMode] = useViewMode("table");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredReports = useMemo(() => {
    let filtered = initialReports;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (report) =>
          report.run?.knowledge_base_name?.toLowerCase().includes(query) ||
          report.run?.run_type.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [initialReports, searchQuery]);

  return (
    <div className="w-full space-y-6">
      <Toolbar
        searchPlaceholder="Search reports..."
        onSearch={setSearchQuery}
        sortOptions={[]}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {filteredReports.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/60 bg-muted/30 p-8 text-center text-muted-foreground">
          {initialReports.length === 0
            ? "No reports found."
            : "No reports found matching your search"}
        </div>
      ) : (
        <ReportTable reports={filteredReports} />
      )}
    </div>
  );
}


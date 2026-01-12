"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Toolbar } from "@/features/rag/shared/components/Toolbar";
import { ReportTable } from "./ReportTable";
import type { RunOutput } from "../types";

type ReportWithRun = RunOutput & {
  run?: {
    id: string;
    workflow_name?: string | null;
    workflow_label?: string | null;
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
  const [searchQuery, setSearchQuery] = useState("");

  const filteredReports = useMemo(() => {
    let filtered = initialReports;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (report) =>
          report.run?.knowledge_base_name?.toLowerCase().includes(query) ||
          report.run?.workflow_label?.toLowerCase().includes(query) ||
          report.run?.workflow_name?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [initialReports, searchQuery]);

  return (
    <div className="w-full space-y-3">
      <Toolbar
        searchPlaceholder="Search reports..."
        onSearch={setSearchQuery}
        sortOptions={[]}
      />

      {filteredReports.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-xl border border-dashed border-border/60 bg-muted/30 p-8 text-center text-muted-foreground"
        >
          {initialReports.length === 0
            ? "No reports found."
            : "No reports found matching your search"}
        </motion.div>
      ) : (
        <ReportTable reports={filteredReports} />
      )}
    </div>
  );
}


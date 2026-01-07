"use client";

import { Card } from "@/components/ui/card";
import { ReportRow } from "./ReportRow";
import type { RunOutput } from "../types";
import { AnimatedTable } from "@/features/rag/shared/components/AnimatedTable";

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

interface ReportTableProps {
  reports: ReportWithRun[];
  onView?: (report: RunOutput) => void;
}

export function ReportTable({ reports, onView }: ReportTableProps) {
  return (
    <div className="space-y-2">
      {/* Table Header */}
      <div className="flex items-center gap-4 px-4 py-3 bg-muted/50 rounded-lg text-xs font-medium text-muted-foreground uppercase tracking-wider">
        <div className="flex-1 min-w-0">Report</div>
        <div className="w-32 shrink-0">Type</div>
        <div className="w-24 shrink-0">PDF</div>
        <div className="w-32 shrink-0">Knowledge Base</div>
        <div className="w-36 shrink-0">Created</div>
        <div className="w-20 shrink-0 text-right">Actions</div>
      </div>

      {/* Animated Rows */}
      <AnimatedTable
        getKey={(_, index) => reports[index]?.id || index}
        staggerDelay={0.02}
      >
        {reports.map((report) => (
          <ReportRow
            key={report.id}
            report={report}
            onView={onView ? () => onView(report) : undefined}
          />
        ))}
      </AnimatedTable>
    </div>
  );
}


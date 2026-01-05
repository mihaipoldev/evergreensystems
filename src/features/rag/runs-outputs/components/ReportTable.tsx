"use client";

import { Card } from "@/components/ui/card";
import { ReportRow } from "./ReportRow";
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

      {/* Rows */}
      {reports.map((report) => (
        <ReportRow
          key={report.id}
          report={report}
          onView={onView ? () => onView(report) : undefined}
        />
      ))}
    </div>
  );
}


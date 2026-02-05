"use client";

import { Card } from "@/components/ui/card";
import { TooltipProvider } from "@/components/ui/tooltip";
import { RunRow } from "./RunRow";
import type { Run } from "../types";
import { AnimatedTable } from "@/features/rag/shared/components/AnimatedTable";

interface RunTableProps {
  runs: (Run & { 
    output_json?: unknown;
    knowledge_base_name?: string | null; 
    report_id?: string | null;
    fit_score?: number | null;
    verdict?: "pursue" | "test" | "caution" | "avoid" | null;
  })[];
  onView?: (run: Run) => void;
  onDelete?: () => void;
  hideHeader?: boolean;
  /** When "updated", shows "Last updated" column with updated_at instead of "Created" */
  dateColumn?: "created" | "updated";
}

export function RunTable({ runs, onView, onDelete, hideHeader = false, dateColumn = "created" }: RunTableProps) {
  const dateLabel = dateColumn === "updated" ? "Last updated" : "Created";

  return (
    <TooltipProvider delayDuration={100}>
      <div className="space-y-2">
        {/* Table Header */}
        {!hideHeader && (
          <div className="hidden md:flex items-center gap-4 px-4 py-3 bg-muted/50 rounded-lg text-xs font-medium text-muted-foreground uppercase tracking-wider">
            <div className="flex-1 min-w-0">Run</div>
            <div className="w-20 shrink-0">Usage</div>
            <div className="w-28 shrink-0">Result</div>
            <div className="w-44 shrink-0">Progress</div>
            <div className="w-40 shrink-0">{dateLabel}</div>
            <div className="w-20 shrink-0 text-right">Actions</div>
          </div>
        )}

        {/* Animated Rows */}
        <AnimatedTable
          getKey={(_, index) => runs[index]?.id || index}
          staggerDelay={0.02}
        >
          {runs.map((run) => (
            <RunRow
              key={run.id}
              run={run}
              onView={onView ? () => onView(run) : undefined}
              onDelete={onDelete}
              dateColumn={dateColumn}
            />
          ))}
        </AnimatedTable>
      </div>
    </TooltipProvider>
  );
}


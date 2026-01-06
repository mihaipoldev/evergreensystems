"use client";

import { Card } from "@/components/ui/card";
import { TooltipProvider } from "@/components/ui/tooltip";
import { RunRow } from "./RunRow";
import type { Run } from "../types";
import { AnimatedTable } from "@/features/rag/shared/components/AnimatedTable";

interface RunTableProps {
  runs: (Run & { knowledge_base_name?: string | null })[];
  onView?: (run: Run) => void;
}

export function RunTable({ runs, onView }: RunTableProps) {
  return (
    <TooltipProvider delayDuration={100}>
      <div className="space-y-2">
        {/* Table Header */}
        <div className="flex items-center gap-4 px-4 py-3 bg-muted/50 rounded-lg text-xs font-medium text-muted-foreground uppercase tracking-wider">
          <div className="flex-1 min-w-0">Run</div>
          <div className="w-32 shrink-0">Type</div>
          <div className="w-28 shrink-0">Status</div>
          <div className="w-32 shrink-0">Knowledge Base</div>
          <div className="w-36 shrink-0">Created</div>
          <div className="w-20 shrink-0 text-right">Actions</div>
        </div>

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
            />
          ))}
        </AnimatedTable>
      </div>
    </TooltipProvider>
  );
}


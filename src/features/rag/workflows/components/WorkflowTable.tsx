"use client";

import { Card } from "@/components/ui/card";
import { TooltipProvider } from "@/components/ui/tooltip";
import { WorkflowRow } from "./WorkflowRow";
import type { Workflow } from "../types";
import { AnimatedTable } from "@/features/rag/shared/components/AnimatedTable";

interface WorkflowTableProps {
  workflows: Workflow[];
  onDelete?: () => void;
  onEdit?: (workflow: Workflow) => void;
}

export function WorkflowTable({
  workflows,
  onDelete,
  onEdit,
}: WorkflowTableProps) {
  return (
    <TooltipProvider delayDuration={100}>
      <div className="space-y-3">
        {/* Table Header */}
        <div className="hidden md:flex items-center gap-4 px-4 py-3 bg-muted/50 rounded-lg text-xs font-medium text-muted-foreground uppercase tracking-wider">
          <div className="flex-1 min-w-0">Name</div>
          <div className="w-24 shrink-0">Status</div>
          <div className="w-20 shrink-0">Cost</div>
          <div className="w-24 shrink-0">Time</div>
          <div className="w-28 shrink-0">Updated</div>
          <div className="w-20 shrink-0 text-right">Actions</div>
        </div>

        {/* Animated Rows */}
        <AnimatedTable
          getKey={(_, index) => workflows[index]?.id || index}
          staggerDelay={0.02}
        >
          {workflows.map((workflow) => (
            <WorkflowRow
              key={workflow.id}
              workflow={workflow}
              onDelete={onDelete}
              onEdit={onEdit}
            />
          ))}
        </AnimatedTable>
      </div>
    </TooltipProvider>
  );
}


"use client";

import { Card } from "@/components/ui/card";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ResearchRow } from "./ResearchRow";
import type { ResearchSubject } from "../types";
import { AnimatedTable } from "@/features/rag/shared/components/AnimatedTable";

interface ResearchTableProps {
  researchSubjects: ResearchSubject[];
  onDelete?: () => void;
  onEdit?: (research: ResearchSubject) => void;
}

export function ResearchTable({
  researchSubjects,
  onDelete,
  onEdit,
}: ResearchTableProps) {
  return (
    <TooltipProvider delayDuration={100}>
      <div className="space-y-2">
        {/* Table Header */}
        <div className="flex items-center gap-4 px-4 py-3 bg-muted/50 rounded-lg text-xs font-medium text-muted-foreground uppercase tracking-wider">
          <div className="flex-1 min-w-0">Name</div>
          <div className="w-32 shrink-0">Geography</div>
          <div className="w-24 shrink-0">Type</div>
          <div className="w-20 shrink-0">Runs</div>
          <div className="w-28 shrink-0">Last Researched</div>
          <div className="w-20 shrink-0 text-right">Actions</div>
        </div>

        {/* Animated Rows */}
        <AnimatedTable
          getKey={(_, index) => researchSubjects[index]?.id || index}
          staggerDelay={0.02}
        >
          {researchSubjects.map((research) => (
            <ResearchRow
              key={research.id}
              research={research}
              onDelete={onDelete}
              onEdit={onEdit}
            />
          ))}
        </AnimatedTable>
      </div>
    </TooltipProvider>
  );
}


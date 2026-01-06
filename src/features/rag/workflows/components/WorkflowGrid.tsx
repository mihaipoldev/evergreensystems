"use client";

import { WorkflowCard } from "./WorkflowCard";
import type { Workflow } from "../types";
import { AnimatedGrid } from "@/features/rag/shared/components/AnimatedGrid";

interface WorkflowGridProps {
  workflows: Workflow[];
  onDelete?: () => void;
  onEdit?: (workflow: Workflow) => void;
}

export function WorkflowGrid({
  workflows,
  onDelete,
  onEdit,
}: WorkflowGridProps) {
  return (
    <AnimatedGrid
      getKey={(_, index) => workflows[index]?.id || index}
      staggerDelay={0.04}
    >
      {workflows.map((workflow) => (
        <div key={workflow.id} className="group transform transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1">
          <WorkflowCard
            workflow={workflow}
            onDelete={onDelete}
            onEdit={onEdit}
          />
        </div>
      ))}
    </AnimatedGrid>
  );
}


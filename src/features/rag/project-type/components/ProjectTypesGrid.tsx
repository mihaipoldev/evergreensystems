"use client";

import { ProjectTypeCard } from "./ProjectTypeCard";
import type { ProjectType } from "../types";
import { AnimatedGrid } from "@/features/rag/shared/components/AnimatedGrid";

interface ProjectTypesGridProps {
  projectTypes: ProjectType[];
  onDelete?: () => void;
  onEdit?: (projectType: ProjectType) => void;
}

export function ProjectTypesGrid({
  projectTypes,
  onDelete,
  onEdit,
}: ProjectTypesGridProps) {
  return (
    <AnimatedGrid
      getKey={(_, index) => projectTypes[index]?.id || index}
      staggerDelay={0.04}
    >
      {projectTypes.map((projectType) => (
        <div key={projectType.id} className="group transform transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1">
          <ProjectTypeCard
            projectType={projectType}
            onDelete={onDelete}
            onEdit={onEdit}
          />
        </div>
      ))}
    </AnimatedGrid>
  );
}


"use client";

import { ProjectCard } from "./ProjectCard";
import type { Project } from "../types";
import { AnimatedGrid } from "@/features/rag/shared/components/AnimatedGrid";

type ProjectWithCount = Project & { document_count?: number; linked_kb_name?: string | null };

interface ProjectGridProps {
  projects: ProjectWithCount[];
  onDelete?: () => void;
}

export function ProjectGrid({
  projects,
  onDelete,
}: ProjectGridProps) {
  return (
    <AnimatedGrid
      getKey={(_, index) => projects[index]?.id || index}
      staggerDelay={0.04}
    >
      {projects.map((project) => (
        <div key={project.id} className="group transform transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1">
          <ProjectCard
            project={project}
            linkedKBName={project.linked_kb_name}
            onDelete={onDelete}
          />
        </div>
      ))}
    </AnimatedGrid>
  );
}


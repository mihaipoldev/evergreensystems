"use client";

import { ProjectCard } from "./ProjectCard";
import type { Project } from "../types";

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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          linkedKBName={project.linked_kb_name}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}


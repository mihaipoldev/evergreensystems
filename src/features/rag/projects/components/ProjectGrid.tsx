"use client";

import { ProjectCard } from "./ProjectCard";
import type { Project } from "../types";
import type { ProjectType } from "@/features/rag/project-type/types";
import { AnimatedGrid } from "@/features/rag/shared/components/AnimatedGrid";

type ProjectWithCount = Project & { document_count?: number; linked_kb_name?: string | null };

interface ProjectGridProps {
  projects: ProjectWithCount[];
  projectTypes?: ProjectType[];
  onDelete?: () => void;
  onEdit?: (project: Project) => void;
}

export function ProjectGrid({
  projects,
  projectTypes = [],
  onDelete,
  onEdit,
}: ProjectGridProps) {
  // Create a map of project type IDs to project types for quick lookup
  const projectTypeMap = new Map(projectTypes.map(pt => [pt.id, pt]));

  return (
    <AnimatedGrid
      getKey={(_, index) => projects[index]?.id || index}
      staggerDelay={0.04}
    >
      {projects.map((project) => {
        const projectType = project.project_type_id ? projectTypeMap.get(project.project_type_id) : null;
        return (
          <div key={project.id} className="group transform transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1">
            <ProjectCard
              project={project}
              linkedKBName={project.linked_kb_name}
              projectTypeIcon={projectType?.icon || null}
              onDelete={onDelete}
              onEdit={onEdit}
            />
          </div>
        );
      })}
    </AnimatedGrid>
  );
}


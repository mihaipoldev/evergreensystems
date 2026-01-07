"use client";

import { Card } from "@/components/ui/card";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ProjectRow } from "./ProjectRow";
import type { Project } from "../types";
import type { ProjectType } from "@/features/rag/project-type/types";
import { AnimatedTable } from "@/features/rag/shared/components/AnimatedTable";

type ProjectWithCount = Project & { document_count?: number; linked_kb_name?: string | null };

interface ProjectTableProps {
  projects: ProjectWithCount[];
  projectTypes?: ProjectType[];
  onDelete?: () => void;
  onEdit?: (project: Project) => void;
}

export function ProjectTable({
  projects,
  projectTypes = [],
  onDelete,
  onEdit,
}: ProjectTableProps) {
  // Create a map of project type IDs to project types for quick lookup
  const projectTypeMap = new Map(projectTypes.map(pt => [pt.id, pt]));

  return (
    <TooltipProvider delayDuration={100}>
      <div className="space-y-2">
        {/* Table Header */}
        <div className="flex items-center gap-4 px-4 py-3 bg-muted/50 rounded-lg text-xs font-medium text-muted-foreground uppercase tracking-wider">
          <div className="flex-1 min-w-0">Name</div>
          <div className="w-24 shrink-0">Status</div>
          <div className="w-32 shrink-0">Linked KB</div>
          <div className="w-20 shrink-0">Docs</div>
          <div className="w-28 shrink-0">Updated</div>
          <div className="w-20 shrink-0 text-right">Actions</div>
        </div>

        {/* Animated Rows */}
        <AnimatedTable
          getKey={(_, index) => projects[index]?.id || index}
          staggerDelay={0.02}
        >
          {projects.map((project) => {
            const projectType = project.project_type_id ? projectTypeMap.get(project.project_type_id) : null;
            return (
              <ProjectRow
                key={project.id}
                project={project}
                linkedKBName={project.linked_kb_name}
                projectTypeIcon={projectType?.icon || null}
                onDelete={onDelete}
                onEdit={onEdit}
              />
            );
          })}
        </AnimatedTable>
      </div>
    </TooltipProvider>
  );
}


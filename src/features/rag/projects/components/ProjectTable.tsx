"use client";

import { Card } from "@/components/ui/card";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ProjectRow } from "./ProjectRow";
import type { Project } from "../types";

type ProjectWithCount = Project & { document_count?: number; linked_kb_name?: string | null };

interface ProjectTableProps {
  projects: ProjectWithCount[];
  onDelete?: () => void;
}

export function ProjectTable({
  projects,
  onDelete,
}: ProjectTableProps) {
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

      {/* Rows */}
      {projects.map((project) => (
        <ProjectRow
          key={project.id}
          project={project}
          linkedKBName={project.linked_kb_name}
          onDelete={onDelete}
        />
      ))}
      </div>
    </TooltipProvider>
  );
}


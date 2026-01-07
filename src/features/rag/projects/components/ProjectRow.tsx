"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFolder,
  faDatabase,
} from "@fortawesome/free-solid-svg-icons";
import { ProjectActionsMenu } from "./ProjectActionsMenu";
import { StatusBadge } from "@/features/rag/shared/components/StatusBadge";
import { statusColorMap } from "@/features/rag/shared/config/statusColors";
import type { Project } from "../types";
import { cn } from "@/lib/utils";

type ProjectRowProps = {
  project: Project & { document_count?: number };
  linkedKBName?: string | null;
  projectTypeIcon?: string | null;
  onDelete?: () => void;
  onEdit?: (project: Project) => void;
};

export function ProjectRow({
  project,
  linkedKBName,
  projectTypeIcon,
  onDelete,
  onEdit,
}: ProjectRowProps) {
  const formattedDate = new Date(project.updated_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  // Map status to color using the shared config
  function getStatusColor(status: string): string {
    return statusColorMap[status] || "muted";
  }

  const statusColor = getStatusColor(project.status);

  return (
    <Card className="flex items-center gap-4 p-4 border-none shadow-card-light hover:shadow-card transition-shadow h-20">
      {/* Icon + Name */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="h-9 w-9 rounded-lg bg-secondary flex items-center justify-center shrink-0">
          {projectTypeIcon ? (
            <span className="text-lg">{projectTypeIcon}</span>
          ) : (
            <FontAwesomeIcon
              icon={faFolder}
              className="h-4 w-4 text-primary"
            />
          )}
        </div>
        <div className={cn(
          "min-w-0 flex flex-col h-full",
          project.description ? "justify-start" : "justify-center"
        )}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link 
                href={`/intel/projects/${project.id}`}
                className="font-medium text-foreground truncate hover:text-primary transition-colors cursor-pointer"
              >
                {project.client_name}
              </Link>
            </TooltipTrigger>
            <TooltipContent>
              <p>{project.client_name}</p>
            </TooltipContent>
          </Tooltip>
          {project.description && (
            <p className="text-xs text-muted-foreground truncate mt-0.5">{project.description}</p>
          )}
        </div>
      </div>

      {/* Status */}
      <div className="w-24 shrink-0">
        <StatusBadge 
          color={statusColor}
        >
          {project.status}
        </StatusBadge>
      </div>

      {/* Linked KB */}
      <div className="w-32 shrink-0">
        {linkedKBName ? (
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <FontAwesomeIcon icon={faDatabase} className="h-3.5 w-3.5" />
            <span className="truncate">{linkedKBName}</span>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">—</p>
        )}
      </div>

      {/* Document Count */}
      <div className="w-20 shrink-0">
        <p className="text-sm text-muted-foreground">{project.document_count || 0} docs</p>
      </div>

      {/* Updated */}
      <div className="w-28 shrink-0">
        <p className="text-sm text-muted-foreground">{formattedDate}</p>
      </div>

      {/* Actions */}
      <div className="w-20 shrink-0 flex items-center justify-end">
        <div onClick={(e) => e.stopPropagation()}>
          <ProjectActionsMenu
            project={project}
            onDelete={onDelete}
            onEdit={onEdit}
          />
        </div>
      </div>
    </Card>
  );
}


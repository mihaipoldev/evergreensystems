"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFolder,
  faDatabase,
  faClock,
} from "@fortawesome/free-solid-svg-icons";
import { ProjectActionsMenu } from "./ProjectActionsMenu";
import type { Project } from "../types";
import { cn } from "@/lib/utils";

type ProjectRowProps = {
  project: Project & { document_count?: number };
  linkedKBName?: string | null;
  onDelete?: () => void;
};

export function ProjectRow({
  project,
  linkedKBName,
  onDelete,
}: ProjectRowProps) {
  const formattedDate = new Date(project.updated_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const statusColors: Record<string, string> = {
    active: "bg-green-600/10 text-green-600 dark:text-green-400 border-green-600/20",
    draft: "bg-muted text-muted-foreground border-border",
    archived: "bg-muted text-muted-foreground border-border",
    delivered: "bg-primary/10 text-primary border-primary/20",
    onboarding: "bg-yellow-600/10 text-yellow-600 dark:text-yellow-400 border-yellow-600/20",
  };

  const statusColorClass = statusColors[project.status] || statusColors.draft;

  return (
    <Card className="flex items-center gap-4 p-4 border-none shadow-card-light hover:shadow-card transition-shadow h-20">
      {/* Icon + Name */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="h-9 w-9 rounded-lg bg-secondary flex items-center justify-center shrink-0">
          <FontAwesomeIcon
            icon={faFolder}
            className="h-4 w-4 text-primary"
          />
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
        <Badge variant="outline" className={cn("w-fit capitalize", statusColorClass)}>
          {project.status}
        </Badge>
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
          />
        </div>
      </div>
    </Card>
  );
}


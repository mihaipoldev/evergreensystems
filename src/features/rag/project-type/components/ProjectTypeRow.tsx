"use client";

import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClock,
  faTag,
} from "@fortawesome/free-solid-svg-icons";
import { ProjectTypeActionsMenu } from "./ProjectTypeActionsMenu";
import { StatusBadge } from "@/features/rag/shared/components/StatusBadge";
import { statusColorMap } from "@/features/rag/shared/config/statusColors";
import type { ProjectType } from "../types";
import { cn } from "@/lib/utils";

type ProjectTypeRowProps = {
  projectType: ProjectType;
  onDelete?: () => void;
  onEdit?: (projectType: ProjectType) => void;
};

export function ProjectTypeRow({
  projectType,
  onDelete,
  onEdit,
}: ProjectTypeRowProps) {
  const formattedDate = new Date(projectType.updated_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  // Map status to color using the shared config
  function getStatusColor(status: string): string {
    return statusColorMap[status] || "muted";
  }

  const statusColor = getStatusColor(projectType.enabled ? "enabled" : "disabled");

  return (
    <Card className="flex items-center gap-4 p-4 border-none shadow-card-light hover:shadow-card hover:bg-card/50 dark:hover:bg-muted/40 transition-shadow h-20">
      {/* Icon + Name */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="h-9 w-9 rounded-lg bg-secondary flex items-center justify-center shrink-0">
          {projectType.icon ? (
            <span className="text-lg">{projectType.icon}</span>
          ) : (
            <FontAwesomeIcon
              icon={faTag}
              className="h-4 w-4 text-primary"
            />
          )}
        </div>
        <div className={cn(
          "min-w-0 flex flex-col h-full",
          projectType.description ? "justify-start" : "justify-center"
        )}>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="font-medium text-foreground truncate cursor-pointer">
                {projectType.label}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>{projectType.label}</p>
            </TooltipContent>
          </Tooltip>
          <p className="text-xs text-muted-foreground font-mono truncate mt-0.5">{projectType.name}</p>
          {projectType.description && (
            <p className="text-xs text-muted-foreground truncate mt-0.5">{projectType.description}</p>
          )}
        </div>
      </div>

      {/* Status */}
      <div className="w-24 shrink-0">
        <StatusBadge 
          color={statusColor}
        >
          {projectType.enabled ? "Enabled" : "Disabled"}
        </StatusBadge>
      </div>

      {/* Updated */}
      <div className="w-28 shrink-0">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <FontAwesomeIcon icon={faClock} className="h-3 w-3" />
          <span>{formattedDate}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="w-20 shrink-0 flex items-center justify-end">
        <div onClick={(e) => e.stopPropagation()}>
          <ProjectTypeActionsMenu
            projectType={projectType}
            onDelete={onDelete}
            onEdit={onEdit}
          />
        </div>
      </div>
    </Card>
  );
}


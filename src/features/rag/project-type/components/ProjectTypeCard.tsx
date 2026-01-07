"use client";

import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
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

type ProjectTypeCardProps = {
  projectType: ProjectType;
  onDelete?: () => void;
  onEdit?: (projectType: ProjectType) => void;
};

export function ProjectTypeCard({
  projectType,
  onDelete,
  onEdit,
}: ProjectTypeCardProps) {
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
    <Card className="flex flex-col h-full border-none shadow-card-light hover:shadow-card hover:bg-card/70 transition-all duration-300 overflow-hidden">
      {/* Header */}
      <CardHeader className="flex-row items-center justify-between gap-3 space-y-0 p-4 py-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="h-9 w-9 rounded-lg bg-secondary flex items-center justify-center shrink-0 shadow-icon">
            {projectType.icon ? (
              <span className="text-lg">{projectType.icon}</span>
            ) : (
              <FontAwesomeIcon
                icon={faTag}
                className="h-4 w-4 text-primary"
              />
            )}
          </div>
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <h3 className="font-bold text-foreground truncate hover:text-primary transition-colors cursor-pointer">{projectType.label}</h3>
              </TooltipTrigger>
              <TooltipContent>
                <p>{projectType.label}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
          <ProjectTypeActionsMenu
            projectType={projectType}
            onDelete={onDelete}
            onEdit={onEdit}
          />
        </div>
      </CardHeader>

      {/* Body */}
      <CardContent className="flex-1 p-4 pt-1 space-y-3">
        <StatusBadge 
          color={statusColor}
        >
          {projectType.enabled ? "Enabled" : "Disabled"}
        </StatusBadge>
        <p className="text-xs text-muted-foreground font-mono">{projectType.name}</p>
        {projectType.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {projectType.description}
          </p>
        )}
      </CardContent>

      {/* Footer */}
      <CardFooter className="flex items-center p-4 bg-muted/50">
        <div className="flex items-center h-2 gap-1.5 text-xs text-muted-foreground">
          <FontAwesomeIcon icon={faClock} className="h-3.5 w-3.5" />
          <span>{formattedDate}</span>
        </div>
      </CardFooter>
    </Card>
  );
}


"use client";

import Link from "next/link";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFolder,
  faDatabase,
  faClock,
  faEllipsisVertical,
} from "@fortawesome/free-solid-svg-icons";
import { ProjectActionsMenu } from "./ProjectActionsMenu";
import type { Project } from "../types";
import { cn } from "@/lib/utils";

type ProjectCardProps = {
  project: Project & { document_count?: number };
  linkedKBName?: string | null;
  projectTypeIcon?: string | null;
  onDelete?: () => void;
  onEdit?: (project: Project) => void;
};

export function ProjectCard({
  project,
  linkedKBName,
  projectTypeIcon,
  onDelete,
  onEdit,
}: ProjectCardProps) {
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
    <Card className="flex flex-col h-full border-none hover:bg-card/70 transition-all duration-300 overflow-hidden">
      {/* Header */}
      <CardHeader className="flex-row items-center justify-between gap-3 space-y-0 p-4 py-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="h-9 w-9 rounded-lg bg-secondary flex items-center justify-center shrink-0 shadow-icon">
            {projectTypeIcon ? (
              <span className="text-lg">{projectTypeIcon}</span>
            ) : (
              <FontAwesomeIcon
                icon={faFolder}
                className="h-4 w-4 text-primary"
              />
            )}
          </div>
          <Link href={`/intel/projects/${project.id}`} className="flex-1 min-w-0">
            <TooltipProvider delayDuration={100}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <h3 className="font-bold text-foreground truncate hover:text-primary transition-colors cursor-pointer">
                    {project.client_name}
                  </h3>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{project.client_name}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </Link>
        </div>
        <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
          <ProjectActionsMenu
            project={project}
            onDelete={onDelete}
            onEdit={onEdit}
          />
        </div>
      </CardHeader>

      {/* Body */}
      <CardContent className="flex-1 p-4 pt-1 space-y-3">
        <Badge variant="secondary" className={cn("w-fit", statusColorClass)}>
          {project.status}
        </Badge>
        {project.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {project.description}
          </p>
        )}
        {linkedKBName && (
          <div className="flex items-center gap-1.5 text-sm">
            <FontAwesomeIcon icon={faDatabase} className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">Linked:</span>
            <span className="text-foreground font-medium">{linkedKBName}</span>
          </div>
        )}
        <p className="text-sm text-muted-foreground">
          {project.document_count || 0} {project.document_count === 1 ? "doc" : "docs"}
        </p>
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

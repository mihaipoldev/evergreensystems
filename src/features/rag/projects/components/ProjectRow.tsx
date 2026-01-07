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
} from "@fortawesome/free-solid-svg-icons";
import { ProjectActionsMenu } from "./ProjectActionsMenu";
import { StatusBadge } from "@/features/rag/shared/components/StatusBadge";
import { FitScoreAndVerdict } from "@/features/rag/shared/components/FitScoreAndVerdict";
import { statusColorMap } from "@/features/rag/shared/config/statusColors";
import type { Project } from "../types";
import { cn } from "@/lib/utils";

type ProjectRowProps = {
  project: Project & { 
    document_count?: number;
    runs_count?: { completed: number; processed: number; failed: number };
    niche_intelligence_verdict?: "pursue" | "test" | "avoid" | null;
    niche_intelligence_fit_score?: number | null;
  };
  projectTypeIcon?: string | null;
  isNicheProject?: boolean;
  onDelete?: () => void;
  onEdit?: (project: Project) => void;
};

export function ProjectRow({
  project,
  projectTypeIcon,
  isNicheProject = false,
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

      {/* Conditional columns */}
      {!isNicheProject && (
        <>
          {/* Status */}
          <div className="w-24 shrink-0">
            <StatusBadge 
              color={statusColor}
            >
              {project.status}
            </StatusBadge>
          </div>
        </>
      )}

      {isNicheProject && (
        <>
          {/* Niche Intelligence Fit Score & Verdict */}
          <div className="w-32 shrink-0">
            <FitScoreAndVerdict 
              fit_score={project.niche_intelligence_fit_score} 
              verdict={project.niche_intelligence_verdict}
              showVerdict={false}
            />
          </div>
        </>
      )}

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


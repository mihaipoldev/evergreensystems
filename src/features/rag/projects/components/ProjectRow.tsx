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
import { useBulkSelection } from "@/features/rag/shared/contexts/BulkSelectionContext";
import { shouldIgnoreRowClick } from "@/features/rag/shared/utils/dropdownClickGuard";
import type { Project } from "../types";
import type { ProjectType } from "@/features/rag/project-type/types";
import { cn } from "@/lib/utils";

type ProjectRowProps = {
  project: Project & { 
    document_count?: number;
    runs_count?: { completed: number; processed: number; failed: number };
    niche_intelligence_verdict?: "pursue" | "test" | "caution" | "avoid" | null;
    niche_intelligence_fit_score?: number | null;
    niche_intelligence_updated_at?: string | null;
    niche_intelligence_runs?: Array<{
      id: string;
      verdict: "pursue" | "test" | "caution" | "avoid" | null;
      fit_score: number | null;
      updated_at: string | null;
      status: "complete" | "queued" | "collecting" | "ingesting" | "generating" | "processing" | "failed";
    }> | null;
  };
  projectTypeIcon?: string | null;
  isNicheProject?: boolean;
  projectTypes?: ProjectType[];
  projectTypeName?: string | null;
  onDelete?: () => void;
  onEdit?: (project: Project) => void;
  index?: number;
  projectIds?: string[];
};

// Store last selected index globally for range selection
let lastSelectedIndexRef: number | null = null;

export function ProjectRow({
  project,
  projectTypeIcon,
  isNicheProject = false,
  projectTypes = [],
  projectTypeName,
  onDelete,
  onEdit,
  index,
  projectIds = [],
}: ProjectRowProps) {
  const { isSelected, toggleSelection, selectRange } = useBulkSelection();
  const selected = isSelected(project.id);

  const formattedDate = new Date(project.updated_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const fullDateWithTime = new Date(project.updated_at).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  // Map status to color using the shared config
  function getStatusColor(status: string): string {
    return statusColorMap[status] || "muted";
  }

  const statusColor = getStatusColor(project.status);

  const projectHref = `/intel/projects/${project.id}`;

  const handleLinkClick = (e: React.MouseEvent) => {
    if (shouldIgnoreRowClick(e)) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    if (e.metaKey || e.ctrlKey) {
      e.preventDefault();
      toggleSelection(project.id);
      if (index !== undefined) lastSelectedIndexRef = index;
      return;
    }
    if (e.shiftKey && index !== undefined && projectIds.length > 0) {
      e.preventDefault();
      const currentIndex = index;
      let startIndex = lastSelectedIndexRef;
      if (startIndex !== null && (!projectIds[startIndex] || !isSelected(projectIds[startIndex]))) {
        startIndex = null;
      }
      if (startIndex === null) {
        for (let i = currentIndex - 1; i >= 0; i--) {
          if (projectIds[i] && isSelected(projectIds[i])) {
            startIndex = i;
            break;
          }
        }
        if (startIndex === null) {
          toggleSelection(project.id);
          lastSelectedIndexRef = currentIndex;
          return;
        }
        lastSelectedIndexRef = startIndex;
      }
      selectRange(projectIds, startIndex, currentIndex);
      lastSelectedIndexRef = currentIndex;
    }
  };

  return (
    <>
      {/* Mobile Layout - whole row clickable */}
      <Card 
        className={cn(
          "md:hidden group cursor-pointer hover:bg-card/70 dark:hover:bg-muted/40 shadow-none md:shadow-card rounded-2xl transition-all border-2 p-3",
          selected 
            ? "border-primary/50 bg-primary/5 shadow-md shadow-primary/10 hover:border-primary/80" 
            : "border-transparent"
        )}
      >
        <Link
          href={projectHref}
          className="contents"
          onClick={handleLinkClick}
        >
          <div className="flex items-start gap-3">
            <div className="h-10 w-8 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0">
              {projectTypeIcon ? (
                <span className="text-lg">{projectTypeIcon}</span>
              ) : (
                <FontAwesomeIcon
                  icon={faFolder}
                  className="h-5 w-5 text-primary"
                />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-base break-words">
                {project.name}
              </div>
              <div className="text-sm text-muted-foreground space-y-0">
                {!isNicheProject && (
                  <div>
                    <StatusBadge color={statusColor}>
                      {project.status}
                    </StatusBadge>
                  </div>
                )}
                {isNicheProject && (
                  <div>
                    <FitScoreAndVerdict 
                      fit_score={project.niche_intelligence_fit_score} 
                      verdict={project.niche_intelligence_verdict}
                      showVerdict={false}
                      updatedAt={project.niche_intelligence_updated_at}
                      runs={project.niche_intelligence_runs}
                    />
                  </div>
                )}
                <div>{formattedDate}</div>
              </div>
            </div>
            <div className="flex-shrink-0 ml-2" data-action-menu onClick={(e) => e.stopPropagation()}>
              <ProjectActionsMenu
                project={project}
                projectTypes={projectTypes}
                projectTypeName={projectTypeName}
                onDelete={onDelete}
                onEdit={onEdit}
              />
            </div>
          </div>
        </Link>
      </Card>

      {/* Desktop Layout - whole row clickable */}
      <Link
        href={projectHref}
        className={cn(
          "hidden md:block cursor-pointer rounded-lg border-2",
          selected ? "border-primary/50" : "border-transparent"
        )}
        onClick={handleLinkClick}
      >
        <Card 
          className={cn(
            "flex items-center gap-4 p-4 border-none shadow-card-light hover:shadow-card hover:bg-card/50 dark:hover:bg-muted/40 transition-shadow h-20",
            selected ? "bg-primary/5 hover:border-primary/80" : ""
          )}
        >
          {/* Icon + Name */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0">
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
              <span className="font-medium text-foreground truncate">
                {project.name}
              </span>
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
                  updatedAt={project.niche_intelligence_updated_at}
                  runs={project.niche_intelligence_runs}
                />
              </div>
            </>
          )}

          {/* Updated */}
          <div className="w-28 shrink-0">
            <Tooltip>
              <TooltipTrigger asChild>
                <p className="text-sm text-muted-foreground cursor-help inline-block">{formattedDate}</p>
              </TooltipTrigger>
              <TooltipContent align="center">
                <p>{fullDateWithTime}</p>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Actions - exclude from row navigation */}
          <div className="w-20 shrink-0 flex items-center justify-end" data-action-menu onClick={(e) => e.stopPropagation()}>
            <ProjectActionsMenu
              project={project}
              projectTypes={projectTypes}
              projectTypeName={projectTypeName}
              onDelete={onDelete}
              onEdit={onEdit}
            />
          </div>
        </Card>
      </Link>
    </>
  );
}


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

  const handleRowClick = (e: React.MouseEvent) => {
    // Don't handle if clicking on links, buttons, or action menu
    const target = e.target as HTMLElement;
    if (
      target.closest('a') ||
      target.closest('button') ||
      target.closest('[role="menu"]') ||
      target.closest('[role="menuitem"]')
    ) {
      return;
    }

    // Handle keyboard modifiers
    if (e.metaKey || e.ctrlKey) {
      // CMD/Ctrl + Click: Toggle selection
      e.preventDefault();
      e.stopPropagation();
      toggleSelection(project.id);
      if (index !== undefined) {
        lastSelectedIndexRef = index;
      }
    } else if (e.shiftKey && index !== undefined && projectIds.length > 0) {
      // Shift + Click: Range selection
      e.preventDefault();
      e.stopPropagation();
      const currentIndex = index;
      
      // Find last selected index (either from ref or find in projectIds)
      let startIndex = lastSelectedIndexRef;
      
      // Validate that startIndex actually points to a selected item
      if (startIndex !== null && (!projectIds[startIndex] || !isSelected(projectIds[startIndex]))) {
        startIndex = null;
      }
      
      if (startIndex === null) {
        // Find the last selected item's index
        for (let i = currentIndex - 1; i >= 0; i--) {
          if (projectIds[i] && isSelected(projectIds[i])) {
            startIndex = i;
            break;
          }
        }
        // If no previous selection found, just select current
        if (startIndex === null) {
          toggleSelection(project.id);
          lastSelectedIndexRef = currentIndex;
          return;
        }
        // Update ref to the found index
        lastSelectedIndexRef = startIndex;
      }
      
      selectRange(projectIds, startIndex, currentIndex);
      lastSelectedIndexRef = currentIndex;
    }
    // Normal click: No change (still navigates via Link)
  };

  return (
    <Card 
      className={cn(
        "flex items-center gap-4 p-4 shadow-card-light hover:shadow-card hover:bg-card/70 dark:hover:bg-muted/40 transition-all h-20 cursor-pointer border-2",
        selected 
          ? "border-primary/50 bg-primary/5 shadow-md shadow-primary/10 hover:border-primary/80" 
          : "border-transparent"
      )}
      onClick={handleRowClick}
    >
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

      {/* Actions */}
      <div className="w-20 shrink-0 flex items-center justify-end">
        <div onClick={(e) => e.stopPropagation()}>
          <ProjectActionsMenu
            project={project}
            projectTypes={projectTypes}
            projectTypeName={projectTypeName}
            onDelete={onDelete}
            onEdit={onEdit}
          />
        </div>
      </div>
    </Card>
  );
}


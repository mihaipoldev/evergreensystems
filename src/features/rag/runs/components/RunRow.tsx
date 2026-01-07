"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/features/rag/shared/components/StatusBadge";
import { FitScoreAndVerdict } from "@/features/rag/shared/components/FitScoreAndVerdict";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay } from "@fortawesome/free-solid-svg-icons";
import { RunActionsMenu } from "./RunActionsMenu";
import type { Run } from "../types";
import { getRunLabel } from "../types";
import { cn } from "@/lib/utils";

type RunRowProps = {
  run: Run & { 
    knowledge_base_name?: string | null; 
    report_id?: string | null;
    fit_score?: number | null;
    verdict?: "pursue" | "test" | "avoid" | null;
  };
  onView?: () => void;
  onDelete?: () => void;
};

import { statusColorMap } from "@/features/rag/shared/config/statusColors";

// Map status to color using the shared config
function getStatusColor(status: string): string {
  return statusColorMap[status] || "muted";
}

export function RunRow({ run, onView, onDelete }: RunRowProps) {
  const formattedDate = new Date(run.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  
  // Get status color and map to icon color
  const statusColor = getStatusColor(run.status);
  const iconColorMap: Record<string, string> = {
    "blue-600": "text-blue-600 dark:text-blue-400",
    "orange-600": "text-orange-600 dark:text-orange-400",
    "red-600": "text-red-600 dark:text-red-400",
    "green-600": "text-green-600 dark:text-green-400",
    "yellow-600": "text-yellow-600 dark:text-yellow-400",
    "purple-600": "text-purple-600 dark:text-purple-400",
    "muted": "text-muted-foreground",
  };
  const iconColor = iconColorMap[statusColor] || "text-primary";


  // Use workflow label if available
  const runLabel = getRunLabel(run);

  // Debug: log project_name to see what we're getting
  if (process.env.NODE_ENV === 'development' && !run.project_name && run.project_id) {
    console.log('Run has project_id but no project_name:', { 
      runId: run.id, 
      project_id: run.project_id,
      project_name: run.project_name,
      fullRun: run 
    });
  }

  // Extract progress data from metadata
  const metadata = run.metadata || {};
  const steps = Array.isArray(metadata.steps) ? metadata.steps : [];
  const completedSteps = Array.isArray(metadata.completed_steps_array) 
    ? metadata.completed_steps_array 
    : [];
  const totalSteps = metadata.total_steps || steps.length || 1;
  const completedStepsCount = metadata.completed_steps || completedSteps.length || 0;
  
  // Calculate progress percentage
  const progress = totalSteps > 0 
    ? Math.round((completedStepsCount / totalSteps) * 100) 
    : (run.status === "complete" ? 100 : run.status === "failed" ? 0 : 0);
  
  // Format progress display
  const progressText = run.status === "complete" 
    ? "Complete" 
    : run.status === "failed" 
    ? "Failed" 
    : totalSteps > 0 
    ? `${progress}%` 
    : "—";
  
  const stepsText = totalSteps > 0 
    ? `${completedStepsCount}/${totalSteps} steps` 
    : "";

  // Smart navigation: if complete, go to result, otherwise go to progress
  const isComplete = run.status === "complete";
  
  const titleHref = isComplete 
    ? `/intel/research/${run.id}/result` 
    : `/intel/research/${run.id}`;

  return (
    <Card className="flex items-center gap-4 p-4 border-none shadow-card-light hover:shadow-card transition-shadow h-20">
      {/* Icon + Name */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="h-9 w-9 rounded-lg bg-secondary flex items-center justify-center shrink-0">
          <FontAwesomeIcon icon={faPlay} className={cn("h-4 w-4", iconColor)} />
        </div>
        <div className="min-w-0 flex flex-col h-full justify-center">
          <Tooltip>
            <TooltipTrigger asChild>
              <Link 
                href={titleHref}
                className="font-medium text-foreground truncate hover:text-primary transition-colors cursor-pointer"
              >
                {runLabel}
              </Link>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isComplete ? "View Report" : "View Progress"}</p>
            </TooltipContent>
          </Tooltip>
          {run.project_name && (
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              {run.project_name}
            </p>
          )}
        </div>
      </div>

      {/* Status */}
      <div className="w-28 shrink-0">
        <StatusBadge 
          color={getStatusColor(run.status)}
        >
          {run.status}
        </StatusBadge>
      </div>

      {/* Progress */}
      <div className="w-44 shrink-0 pr-8">
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-foreground">{progressText}</span>
                {stepsText && (
                  <span className="text-xs text-muted-foreground">{stepsText}</span>
                )}
              </div>
              {(run.status !== "complete" && run.status !== "failed" && totalSteps > 0) && (
                <Progress 
                  value={progress} 
                  className={cn("h-1.5", {
                    "[&>div]:bg-blue-600": statusColor === "blue-600",
                    "[&>div]:bg-orange-600": statusColor === "orange-600",
                    "[&>div]:bg-red-600": statusColor === "red-600",
                    "[&>div]:bg-green-600": statusColor === "green-600",
                    "[&>div]:bg-yellow-600": statusColor === "yellow-600",
                    "[&>div]:bg-purple-600": statusColor === "purple-600",
                    "[&>div]:bg-muted": statusColor === "muted",
                  })} 
                />
              )}
              {(run.status === "complete" || run.status === "failed") && totalSteps > 0 && (
                <Progress 
                  value={run.status === "complete" ? 100 : 0} 
                  className={cn(
                    "h-1.5",
                    {
                      "[&>div]:bg-blue-600": statusColor === "blue-600",
                      "[&>div]:bg-orange-600": statusColor === "orange-600",
                      "[&>div]:bg-red-600": statusColor === "red-600",
                      "[&>div]:bg-green-600": statusColor === "green-600",
                      "[&>div]:bg-yellow-600": statusColor === "yellow-600",
                      "[&>div]:bg-purple-600": statusColor === "purple-600",
                      "[&>div]:bg-muted": statusColor === "muted",
                    },
                    run.status === "complete" && "opacity-60"
                  )} 
                />
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="flex flex-col gap-1">
              <p className="font-medium">Progress: {progress}%</p>
              {stepsText && <p className="text-xs text-muted-foreground">{stepsText}</p>}
              {run.status === "complete" && <p className="text-xs text-green-600 dark:text-green-400">Completed</p>}
              {run.status === "failed" && <p className="text-xs text-destructive">Failed</p>}
            </div>
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Fit Score & Verdict */}
      <div className="w-24 shrink-0">
        {run.status === "complete" ? (
          <FitScoreAndVerdict fit_score={run.fit_score} verdict={run.verdict} />
        ) : (
          <span className="text-sm text-muted-foreground">—</span>
        )}
      </div>

      {/* Created */}
      <div className="w-40 shrink-0">
        <p className="text-sm text-muted-foreground">{formattedDate}</p>
      </div>

      {/* Actions */}
      <div className="w-20 shrink-0 flex items-center justify-end">
        <div onClick={(e) => e.stopPropagation()}>
          <RunActionsMenu run={run} onDelete={onDelete} />
        </div>
      </div>
    </Card>
  );
}


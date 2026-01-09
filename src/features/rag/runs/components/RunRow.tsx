"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/features/rag/shared/components/StatusBadge";
import { FitScoreAndVerdict } from "@/features/rag/shared/components/FitScoreAndVerdict";
import { RunProgress } from "@/features/rag/shared/components/RunProgress";
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
import { extractWorkflowResult } from "../utils/extractWorkflowResult";
import { cn } from "@/lib/utils";

type RunRowProps = {
  run: Run & { 
    knowledge_base_name?: string | null; 
    report_id?: string | null;
    fit_score?: number | null;
    verdict?: "pursue" | "test" | "caution" | "avoid" | null;
  };
  onView?: () => void;
  onDelete?: () => void;
};

import { getRunStatusGradientClasses } from "@/features/rag/shared/utils/runStatusColors";

export function RunRow({ run, onView, onDelete }: RunRowProps) {
  const formattedDate = new Date(run.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  
  // Get status color classes using the utility
  const statusColors = getRunStatusGradientClasses(run.status);
  const iconColor = statusColors.iconColor;


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

  // Smart navigation: if complete, go to result, otherwise go to progress
  const isComplete = run.status === "complete";
  
  const titleHref = isComplete 
    ? `/intel/research/${run.id}/result` 
    : `/intel/research/${run.id}`;

  return (
    <Card className="flex items-center gap-4 p-4 border-none shadow-card-light hover:shadow-card hover:bg-card/50 dark:hover:bg-muted/40 transition-shadow h-20">
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

      {/* Fit Score & Verdict */}
      <div className="w-28 shrink-0">
        {run.status === "complete" ? (
          (() => {
            console.log("[RunRow] Extracting workflow result for run:", run.id);
            console.log("[RunRow] Full run object:", run);
            const workflowResult = extractWorkflowResult(run);
            console.log("[RunRow] Workflow result:", workflowResult);
            if (workflowResult) {
              console.log("[RunRow] Rendering FitScoreAndVerdict with:", { score: workflowResult.score, verdict: workflowResult.verdict });
              return <FitScoreAndVerdict fit_score={workflowResult.score} verdict={workflowResult.verdict} />;
            }
            console.log("[RunRow] No workflow result, hiding column");
            return null;
          })()
        ) : null}
      </div>

      {/* Progress */}
      <RunProgress 
        status={run.status} 
        metadata={run.metadata}
      />

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


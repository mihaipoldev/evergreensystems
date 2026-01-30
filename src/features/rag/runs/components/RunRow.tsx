"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/features/rag/shared/components/StatusBadge";
import { FitScoreAndVerdict } from "@/features/rag/shared/components/FitScoreAndVerdict";
import { RunProgress } from "@/features/rag/shared/components/RunProgress";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay } from "@fortawesome/free-solid-svg-icons";
import { RunActionsMenu } from "./RunActionsMenu";
import { shouldIgnoreRowClick } from "@/features/rag/shared/utils/dropdownClickGuard";
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

  // Extract workflow result for mobile layout
  const workflowResult = run.status === "complete" ? extractWorkflowResult(run) : null;

  return (
    <>
      {/* Mobile Layout */}
      <Card className="md:hidden border-none shadow-none hover:bg-card/50 dark:hover:bg-muted/40 transition-shadow p-3">
        <Link
          href={titleHref}
          className="contents"
          onClick={(e) => {
            if (shouldIgnoreRowClick(e)) {
              e.preventDefault();
              e.stopPropagation();
            }
          }}
        >
          <div className="flex items-start gap-3">
            <div className="h-10 w-8 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
              <FontAwesomeIcon icon={faPlay} className={cn("h-5 w-5", iconColor)} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-base break-words">
                {runLabel}
              </div>
              {run.project_name && (
                <div className="text-xs text-muted-foreground mt-0.5 break-words">
                  {run.project_name}
                </div>
              )}
              <div className="text-sm text-muted-foreground space-y-0 mt-2">
                {workflowResult && (
                  <div>
                    <FitScoreAndVerdict fit_score={workflowResult.score} verdict={workflowResult.verdict} />
                  </div>
                )}
                <div>
                  <RunProgress status={run.status} metadata={run.metadata} className="!w-full !pr-0" />
                </div>
                <div>{formattedDate}</div>
              </div>
            </div>
            <div className="flex-shrink-0 ml-2" data-action-menu onClick={(e) => e.stopPropagation()}>
              <RunActionsMenu run={run} onDelete={onDelete} />
            </div>
          </div>
        </Link>
      </Card>

      {/* Desktop Layout - whole row clickable, same destination as title */}
      <Link
        href={titleHref}
        className="hidden md:block cursor-pointer"
        title={isComplete ? "View Report" : "View Progress"}
        onClick={(e) => {
          if (shouldIgnoreRowClick(e)) {
            e.preventDefault();
            e.stopPropagation();
          }
        }}
      >
        <Card className="flex items-center gap-4 p-4 border-none shadow-card-light hover:shadow-card hover:bg-card/50 dark:hover:bg-muted/40 transition-shadow h-20">
          {/* Icon + Name */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="h-9 w-9 rounded-lg bg-secondary flex items-center justify-center shrink-0">
              <FontAwesomeIcon icon={faPlay} className={cn("h-4 w-4", iconColor)} />
            </div>
            <div className="min-w-0 flex flex-col h-full justify-center">
              <span className="font-medium text-foreground truncate">
                {runLabel}
              </span>
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
                const workflowResult = extractWorkflowResult(run);
                if (workflowResult) {
                  return <FitScoreAndVerdict fit_score={workflowResult.score} verdict={workflowResult.verdict} />;
                }
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

          {/* Actions - exclude from row navigation */}
          <div className="w-20 shrink-0 flex items-center justify-end" data-action-menu onClick={(e) => e.stopPropagation()}>
            <RunActionsMenu run={run} onDelete={onDelete} />
          </div>
        </Card>
      </Link>
    </>
  );
}


"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner, faArrowUpRightFromSquare } from "@fortawesome/free-solid-svg-icons";
import {
  getFitScoreCategory,
  getFitScoreColorClasses,
  getFitScoreBadgeClasses,
  getFitScoreLabel,
} from "../utils/fitScoreColors";
import { getRunStatusLabel } from "../utils/runStatusColors";

type RunData = {
  id?: string;
  verdict: "pursue" | "test" | "caution" | "avoid" | null;
  fit_score: number | null;
  updated_at: string | null;
  status: "complete" | "queued" | "collecting" | "ingesting" | "generating" | "processing" | "failed";
};

type FitScoreTooltipProps = {
  children: ReactNode;
  fit_score: number | null | undefined;
  verdict: "pursue" | "test" | "caution" | "avoid" | null | undefined;
  updatedAt?: string | null;
  runs?: RunData[] | null;
  align?: "start" | "center" | "end";
  side?: "top" | "right" | "bottom" | "left";
  sideOffset?: number;
};

export function FitScoreTooltip({
  children,
  fit_score,
  verdict,
  updatedAt,
  runs,
  align = "center",
  side = "bottom",
  sideOffset = 8,
}: FitScoreTooltipProps) {
  const hasFitScore = fit_score !== null && fit_score !== undefined;
  const formattedScore = hasFitScore ? fit_score.toFixed(1) : null;

  // Determine category based on score (priority) or verdict (fallback)
  const category = getFitScoreCategory(fit_score ?? null, verdict ?? null);
  const colorClasses = getFitScoreColorClasses(category);
  const badgeClasses = getFitScoreBadgeClasses(category);

  // For tooltip, always show verdict if it exists
  const tooltipHasVerdict = verdict !== null && verdict !== undefined;
  const tooltipVerdictCategory = getFitScoreCategory(fit_score ?? null, verdict ?? null);
  const tooltipVerdictLabel = getFitScoreLabel(tooltipVerdictCategory);
  const tooltipBadgeClasses = getFitScoreBadgeClasses(tooltipVerdictCategory);

  // Format date helper
  const formatRunDate = (dateString: string | null) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formattedDate = updatedAt ? formatRunDate(updatedAt) : null;
  const hasRuns = runs && runs.length > 0;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {children}
      </TooltipTrigger>
      <TooltipContent
        className="max-w-sm"
        align={align}
        side={side}
        sideOffset={sideOffset}
        collisionPadding={16}
      >
        <div className="flex flex-col gap-2">
          {/* Render the current fit score and verdict with colors */}
          <div className="flex flex-col gap-1.5">
            {hasFitScore && (
              <div className="flex items-center gap-1">
                <span className={cn("text-lg font-semibold", colorClasses)}>
                  {formattedScore}
                </span>
                <span className="text-xs text-muted-foreground">/100</span>
              </div>
            )}
            {(tooltipHasVerdict || (hasFitScore && category !== "avoid")) && (
              <div className={cn("text-xs font-medium px-2 py-0.5 rounded w-fit border", tooltipBadgeClasses)}>
                {tooltipVerdictLabel}
              </div>
            )}
          </div>

          {/* Show all runs if available */}
          {hasRuns && runs && runs.length > 0 && (
            <div className="border-t pt-2">
              <p className="text-xs font-medium text-muted-foreground mb-1.5">All Evaluations:</p>
              <div className="max-h-48 overflow-y-auto space-y-2 -mr-3 pr-3">
                {runs.map((run, index) => {
                  const runStatus = run.status || "complete";
                  // Check if run is in progress (any status that's not complete or failed)
                  const isInProgress = !["complete", "failed"].includes(runStatus);
                  const runCategory = getFitScoreCategory(run.fit_score ?? null, run.verdict ?? null);
                  const runColorClasses = getFitScoreColorClasses(runCategory);
                  const runFormattedScore = run.fit_score !== null && run.fit_score !== undefined
                    ? run.fit_score.toFixed(1)
                    : null;
                  const runFormattedDate = formatRunDate(run.updated_at);

                  // Format status label using the utility function
                  const statusLabel = getRunStatusLabel(runStatus);

                  // Determine navigation URL based on status
                  const isComplete = runStatus === "complete";
                  const runHref = run.id
                    ? (isComplete
                        ? `/intel/research/${run.id}/result`
                        : `/intel/research/${run.id}`)
                    : null;

                  return (
                    <div key={index} className="flex flex-col gap-1 text-xs border-b pb-1.5 last:border-0 last:pb-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {isInProgress ? (
                            <div className="flex items-center gap-2">
                              <FontAwesomeIcon
                                icon={faSpinner}
                                className="h-3 w-3 text-muted-foreground animate-spin"
                              />
                              <span className="text-muted-foreground font-medium">{statusLabel}...</span>
                            </div>
                          ) : (
                            <>
                              {runFormattedScore !== null && (
                                <div className="flex items-center gap-1">
                                  <span className={cn("font-semibold", runColorClasses)}>
                                    {runFormattedScore}
                                  </span>
                                  <span className="text-muted-foreground">/100</span>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                        {runHref && (
                          <Link
                            href={runHref}
                            onClick={(e) => e.stopPropagation()}
                            className="p-1 transition-colors text-muted-foreground hover:text-foreground"
                            title={isComplete ? "View Report" : "View Progress"}
                          >
                            <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="h-2.5 w-2.5" />
                          </Link>
                        )}
                      </div>
                      {runFormattedDate && (
                        <p className="text-muted-foreground">{runFormattedDate}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Show the date if no runs list available */}
          {!hasRuns && formattedDate && (
            <p className="text-xs text-muted-foreground border-t pt-1.5">
              {formattedDate}
            </p>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}


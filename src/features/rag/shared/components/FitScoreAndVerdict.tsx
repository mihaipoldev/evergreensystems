"use client";

import { cn } from "@/lib/utils";
import {
  getFitScoreCategory,
  getFitScoreColorClasses,
  getFitScoreBadgeClasses,
  getFitScoreLabel,
} from "../utils/fitScoreColors";
import { FitScoreTooltip } from "./FitScoreTooltip";

type RunData = {
  id?: string;
  verdict: "pursue" | "test" | "caution" | "avoid" | null;
  fit_score: number | null;
  updated_at: string | null;
  status: "complete" | "queued" | "collecting" | "ingesting" | "generating" | "processing" | "failed";
};

type FitScoreAndVerdictProps = {
  fit_score: number | null | undefined;
  verdict: "pursue" | "test" | "caution" | "avoid" | null | undefined;
  className?: string;
  showVerdict?: boolean; // Option to hide verdict badge
  updatedAt?: string | null; // Date when the fit score was calculated
  runs?: RunData[] | null; // All runs for this evaluation
};

export function FitScoreAndVerdict({ fit_score, verdict, className, showVerdict = true, updatedAt, runs }: FitScoreAndVerdictProps) {
  const hasFitScore = fit_score !== null && fit_score !== undefined;
  const hasVerdict = verdict !== null && verdict !== undefined && showVerdict;
  const formattedScore = hasFitScore ? fit_score.toFixed(1) : null;

  // Determine category based on score (priority) or verdict (fallback)
  const category = getFitScoreCategory(fit_score ?? null, verdict ?? null);
  const colorClasses = getFitScoreColorClasses(category);
  const badgeClasses = getFitScoreBadgeClasses(category);
  const label = getFitScoreLabel(category);

  // Show badge if: verdict exists OR score determines category (like "ideal" for >=85)
  // When showVerdict is false, only show if there's an explicit verdict prop
  const shouldShowBadge = showVerdict && (hasVerdict || (hasFitScore && category !== "avoid"));

  if (!hasFitScore && !hasVerdict) {
    return <span className="text-sm text-muted-foreground">—</span>;
  }

  const content = (
    <div className={cn("flex flex-col gap-0.5", className)}>
      {hasFitScore && (
        <div className="flex items-center gap-1">
          <span className={cn("text-lg font-semibold", colorClasses)}>
            {formattedScore}
          </span>
          <span className="text-xs text-muted-foreground">/100</span>
        </div>
      )}
      {shouldShowBadge && (
        <div className={cn("text-xs font-medium px-2 py-0.5 rounded w-fit border", badgeClasses)}>
          {label}
        </div>
      )}
    </div>
  );

  // Show tooltip if we have a date or runs (always show detailed info when available)
  const hasTooltipInfo = updatedAt !== null && updatedAt !== undefined;
  const hasRuns = runs && runs.length > 0;

  if (hasTooltipInfo || hasRuns) {
    return (
      <FitScoreTooltip
        fit_score={fit_score}
        verdict={verdict}
        updatedAt={updatedAt}
        runs={runs}
      >
        <div className="cursor-help inline-block">
          {content}
        </div>
      </FitScoreTooltip>
    );
  }

  return content;
}


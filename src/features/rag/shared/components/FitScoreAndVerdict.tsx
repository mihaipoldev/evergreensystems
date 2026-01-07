"use client";

import { cn } from "@/lib/utils";

type FitScoreAndVerdictProps = {
  fit_score: number | null | undefined;
  verdict: "pursue" | "test" | "avoid" | null | undefined;
  className?: string;
  showVerdict?: boolean; // Option to hide verdict badge
};

// Helper function for fit score color based on verdict
const getVerdictColor = (verdict?: "pursue" | "test" | "avoid" | null) => {
  if (verdict === 'pursue') return 'text-green-600 dark:text-green-400';
  if (verdict === 'test') return 'text-yellow-600 dark:text-yellow-400';
  if (verdict === 'avoid') return 'text-red-600 dark:text-red-400';
  return 'text-muted-foreground';
};

const getVerdictBadgeClasses = (verdict: "pursue" | "test" | "avoid") => {
  if (verdict === 'pursue') {
    return 'bg-green-600/10 text-green-600 dark:text-green-400 border-green-600/20';
  }
  if (verdict === 'test') {
    return 'bg-yellow-600/10 text-yellow-600 dark:text-yellow-400 border-yellow-600/20';
  }
  return 'bg-red-600/10 text-red-600 dark:text-red-400 border-red-600/20';
};

const getVerdictLabel = (verdict: "pursue" | "test" | "avoid"): string => {
  if (verdict === 'pursue') return 'Pursue';
  if (verdict === 'test') return 'Test';
  return 'Avoid';
};

export function FitScoreAndVerdict({ fit_score, verdict, className, showVerdict = true }: FitScoreAndVerdictProps) {
  const hasFitScore = fit_score !== null && fit_score !== undefined;
  const hasVerdict = verdict !== null && verdict !== undefined && showVerdict;

  if (!hasFitScore && !hasVerdict) {
    return <span className="text-sm text-muted-foreground">—</span>;
  }

  return (
    <div className={cn("flex flex-col gap-0.5", className)}>
      {hasFitScore && (
        <div className="flex items-center gap-1">
          <span className={cn("text-lg font-semibold", getVerdictColor(verdict))}>
            {fit_score}
          </span>
          <span className="text-xs text-muted-foreground">/100</span>
        </div>
      )}
      {hasVerdict && (
        <div className={cn("text-xs font-medium px-2 py-0.5 rounded w-fit", getVerdictBadgeClasses(verdict))}>
          {getVerdictLabel(verdict)}
        </div>
      )}
    </div>
  );
}


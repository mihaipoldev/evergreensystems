"use client";

import { cn } from "@/lib/utils";
import { getFitScoreCategory, getFitScoreColorClasses } from "../../../shared/utils/fitScoreColors";

function formatLabel(label: string): string {
  return label
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

interface DimensionScoreBarProps {
  label: string;
  score: number;
  className?: string;
}

export const DimensionScoreBar = ({
  label,
  score,
  className,
}: DimensionScoreBarProps) => {
  const numericScore = Math.max(0, Math.min(100, Number(score) || 0));
  const category = getFitScoreCategory(numericScore, null);
  const colorClass = getFitScoreColorClasses(category);

  // Map category to progress bar filled color
  const getProgressColor = () => {
    switch (category) {
      case "ideal":
        return "bg-emerald-500";
      case "pursue":
        return "bg-green-600";
      case "test":
        return "bg-yellow-600";
      case "caution":
        return "bg-orange-600";
      case "avoid":
        return "bg-red-600";
    }
  };

  // Same color as filled bar but maximum dimness for the track (unfilled rest)
  const getTrackColor = () => {
    switch (category) {
      case "ideal":
        return "bg-emerald-500/[0.03]";
      case "pursue":
        return "bg-green-600/[0.03]";
      case "test":
        return "bg-yellow-600/[0.03]";
      case "caution":
        return "bg-orange-600/[0.03]";
      case "avoid":
        return "bg-red-600/[0.03]";
    }
  };

  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex justify-between items-center gap-2 text-sm">
        <span className="font-medium text-foreground">{formatLabel(label)}</span>
        <span className={cn("tabular-nums", colorClass)}>{Math.round(numericScore)}</span>
      </div>
      <div className={cn("relative h-2 w-full overflow-hidden rounded-full", getTrackColor())}>
        <div
          className={cn("h-full transition-all", getProgressColor())}
          style={{ width: `${numericScore}%` }}
        />
      </div>
    </div>
  );
};

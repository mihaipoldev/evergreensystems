"use client";

import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { getRunStatusColorClasses, getRunStatusColorString, getRunStatusLabel } from "@/features/rag/shared/utils/runStatusColors";

type RunProgressProps = {
  status: string;
  metadata?: Record<string, any> | null;
  statusColor?: string; // Optional for backward compatibility
  className?: string;
};

/**
 * RunProgress component displays progress information for a run
 * Shows progress percentage, steps, and a progress bar based on run status and metadata
 */
export function RunProgress({ 
  status, 
  metadata, 
  statusColor,
  className 
}: RunProgressProps) {
  // Use utility to get status color if not provided (for backward compatibility)
  const effectiveStatusColor = statusColor || getRunStatusColorString(status);
  // Extract progress data from metadata
  const metadataObj = metadata || {};
  const steps = Array.isArray(metadataObj.steps) ? metadataObj.steps : [];
  const completedSteps = Array.isArray(metadataObj.completed_steps_array) 
    ? metadataObj.completed_steps_array 
    : [];
  const totalSteps = metadataObj.total_steps || steps.length || 1;
  const completedStepsCount = metadataObj.completed_steps || completedSteps.length || 0;
  
  // Calculate progress percentage
  const progress = totalSteps > 0 
    ? Math.round((completedStepsCount / totalSteps) * 100) 
    : (status === "complete" ? 100 : status === "failed" ? 0 : 0);
  
  // Format progress display
  const progressText = status === "complete" 
    ? "Complete" 
    : status === "failed" 
    ? "Failed" 
    : totalSteps > 0 
    ? `${progress}%` 
    : "—";
  
  const stepsText = totalSteps > 0 
    ? `${completedStepsCount}/${totalSteps} steps` 
    : "";

  // Format status text using utility
  const statusText = getRunStatusLabel(status);
  
  // Get status color class using utility
  const statusTextColor = getRunStatusColorClasses(status);

  const progressBarClasses = cn("h-1.5", {
    "[&>div]:bg-blue-600": effectiveStatusColor === "blue-600",
    "[&>div]:bg-orange-600": effectiveStatusColor === "orange-600",
    "[&>div]:bg-red-600": effectiveStatusColor === "red-600",
    "[&>div]:bg-green-600": effectiveStatusColor === "green-600",
    "[&>div]:bg-yellow-600": effectiveStatusColor === "yellow-600",
    "[&>div]:bg-purple-600": effectiveStatusColor === "purple-600",
    "[&>div]:bg-muted": effectiveStatusColor === "muted",
  });

  return (
    <div className={cn("w-44 shrink-0 pr-8", className)}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium text-foreground">{progressText}</span>
              {stepsText && (
                <span className="text-xs text-muted-foreground">{stepsText}</span>
              )}
            </div>
            {(status !== "complete" && status !== "failed" && totalSteps > 0) && (
              <Progress value={progress} className={progressBarClasses} />
            )}
            {status === "complete" && totalSteps > 0 && (
              <Progress value={100} className={cn(progressBarClasses, "opacity-60")} />
            )}
            {status === "failed" && (
              <Progress value={100} className={progressBarClasses} />
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="flex flex-col gap-1">
            <p className="font-medium">Progress: {progress}%</p>
            {stepsText && <p className="text-xs text-muted-foreground">{stepsText}</p>}
            <p className={cn("text-xs font-medium", statusTextColor)}>{statusText}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}


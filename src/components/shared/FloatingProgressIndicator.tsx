"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSpinner,
  faChevronUp,
  faX,
} from "@fortawesome/free-solid-svg-icons";
import { useProcessingRuns } from "@/hooks/useProcessingRuns";
import { getRunLabel } from "@/features/rag/runs/types";
import { statusColorMap } from "@/features/rag/shared/config/statusColors";
import { getRunStatusBadgeClasses, getRunStatusLabel } from "@/features/rag/shared/utils/runStatusColors";
import { cn } from "@/lib/utils";

/**
 * Calculate progress percentage from run metadata
 * Uses the same logic as RunProgress component
 */
function calculateProgress(
  status: string,
  metadata?: Record<string, any> | null
): number {
  if (status === "complete") return 100;
  if (status === "failed") return 0;

  const metadataObj = metadata || {};
  const steps = Array.isArray(metadataObj.steps) ? metadataObj.steps : [];
  const completedSteps = Array.isArray(metadataObj.completed_steps_array)
    ? metadataObj.completed_steps_array
    : [];
  const totalSteps = metadataObj.total_steps || steps.length || 1;
  const completedStepsCount =
    metadataObj.completed_steps || completedSteps.length || 0;

  return totalSteps > 0
    ? Math.round((completedStepsCount / totalSteps) * 100)
    : 0;
}

/**
 * Get status color class based on status
 */
function getStatusColorClass(status: string): string {
  const color = statusColorMap[status] || "muted";
  const colorMap: Record<string, string> = {
    "blue-600": "bg-blue-600",
    "orange-600": "bg-orange-600",
    "red-600": "bg-red-600",
    "green-600": "bg-green-600",
    "yellow-600": "bg-yellow-600",
    "purple-600": "bg-purple-600",
    muted: "bg-muted",
  };
  return colorMap[color] || "bg-muted";
}

/**
 * Get subject text from run input
 */
function getRunSubject(run: any): string {
  if (run.input?.niche_name) {
    return run.input.niche_name;
  }
  if (run.input?.subject) {
    return run.input.subject;
  }
  if (run.project_name) {
    return run.project_name;
  }
  return "Processing...";
}

export function FloatingProgressIndicator() {
  const router = useRouter();
  const { runs, isLoading } = useProcessingRuns();
  const [isExpanded, setIsExpanded] = useState(false);

  if (isLoading || runs.length === 0) return null;

  const handleViewRun = (runId: string) => {
    const run = runs.find((r) => r.id === runId);
    if (!run) return;

    // Navigate based on status
    if (run.status === "complete") {
      router.push(`/intel/research/${runId}/result`);
    } else {
      router.push(`/intel/research/${runId}`);
    }
  };

  return (
    <motion.div
      className="fixed bottom-6 right-6 z-40"
      initial={{ opacity: 0, y: 50, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 50, scale: 0.8 }}
    >
      <AnimatePresence mode="wait">
        {isExpanded ? (
          <motion.div
            key="expanded"
            className="bg-card rounded-2xl shadow-lg border border-border overflow-hidden min-w-[320px] max-w-[400px]"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary w-8 h-8 flex items-center justify-center">
                  <FontAwesomeIcon
                    icon={faSpinner}
                    className="h-4 w-4 text-primary-foreground"
                    spin
                  />
                </div>
                <span className="font-semibold">Active Runs</span>
                <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs font-medium">
                  {runs.length}
                </span>
              </div>
              <button
                onClick={() => setIsExpanded(false)}
                className="p-1 rounded-lg w-8 h-8 flex items-center justify-center"
                aria-label="Collapse"
              >
                <FontAwesomeIcon
                  icon={faX}
                  className="h-4 w-4 text-muted-foreground"
                />
              </button>
            </div>

            {/* Runs List */}
            <div className="max-h-[300px] overflow-y-auto">
              {runs.map((run) => {
                const progress = calculateProgress(run.status, run.metadata);
                const runLabel = getRunLabel(run);
                const subject = getRunSubject(run);
                const statusColor = statusColorMap[run.status] || "muted";

                return (
                  <motion.button
                    key={run.id}
                    className="w-full p-3 border-b border-border last:border-0 hover:bg-muted/50 transition-colors text-left"
                    onClick={() => handleViewRun(run.id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="font-medium text-sm truncate">
                          {runLabel}
                        </span>
                        <span className={cn(
                          "text-[10px] px-1.5 py-0.5 rounded shrink-0 border",
                          getRunStatusBadgeClasses(run.status)
                        )}>
                          {getRunStatusLabel(run.status)}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {progress}%
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground mb-1 truncate">
                      {subject}
                    </div>
                    <div className="h-1 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        className={cn("h-full rounded-full", getStatusColorClass(run.status))}
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        ) : (
          <motion.button
            key="collapsed"
            className="relative flex items-center gap-3 px-4 py-3 bg-card rounded-2xl shadow-lg border border-border hover:shadow-xl transition-shadow"
            onClick={() => setIsExpanded(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="View active runs"
          >
            {/* Pulse indicator */}
            <motion.div
              className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-green-600"
              animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />

            <div className="p-2 rounded-lg bg-primary w-8 h-8 flex items-center justify-center">
              <FontAwesomeIcon
                icon={faSpinner}
                className="h-4 w-4 text-primary-foreground"
                spin
              />
            </div>

            <div className="text-left min-w-0 flex-1">
              <div className="text-sm font-medium">
                {runs.length} active run{runs.length > 1 ? "s" : ""}
              </div>
              <div className="text-xs text-muted-foreground truncate">
                {getRunLabel(runs[0])} -{" "}
                {calculateProgress(runs[0].status, runs[0].metadata)}%
              </div>
            </div>

            <FontAwesomeIcon
              icon={faChevronUp}
              className="h-4 w-4 text-muted-foreground shrink-0"
            />
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
}


"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faSpinner,
  faClock,
  faChevronDown,
  faChartLine,
  faUsers,
  faDatabase,
  faSearch,
  faBolt,
  faMapMarkerAlt,
  faBullseye,
} from "@fortawesome/free-solid-svg-icons";
import { cn } from "@/lib/utils";

interface Step {
  id: string;
  title: string;
  description: string;
  status: "completed" | "active" | "waiting";
  duration?: string;
  stats?: {
    label: string;
    value: string;
  }[];
  icon: any;
}

interface ProgressTimelineProps {
  steps: string[];
  completedSteps: string[];
  currentStep: string;
  startedAt?: string;
  completedAt?: string | null;
  sourcesCount?: number;
  documentsCreated?: number;
}

/**
 * Map step IDs to human-readable names
 */
function getStepName(stepId: string): string {
  const stepNames: Record<string, string> = {
    market_analyst: "Market Analyst",
    buyer_intelligence: "Buyer Intelligence",
    strategic_evaluator: "Strategic Evaluator",
    tactical_planner: "Tactical Planner",
    market_positioning: "Market Positioning",
  };
  return stepNames[stepId] || stepId.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}

/**
 * Map step IDs to Font Awesome icons
 */
function getStepIcon(stepId: string) {
  const iconMap: Record<string, any> = {
    market_analyst: faChartLine,
    buyer_intelligence: faUsers,
    strategic_evaluator: faBullseye,
    tactical_planner: faMapMarkerAlt,
    market_positioning: faBolt,
  };
  return iconMap[stepId] || faDatabase;
}

/**
 * Get step description based on step ID
 */
function getStepDescription(stepId: string): string {
  const descriptions: Record<string, string> = {
    market_analyst: "Gathering market data and analyzing industry trends",
    buyer_intelligence: "Profiling key buyers and their decision-making processes",
    strategic_evaluator: "Evaluating strategic opportunities and positioning",
    tactical_planner: "Developing tactical plans and action items",
    market_positioning: "Analyzing market positioning and competitive landscape",
  };
  return descriptions[stepId] || "Processing step";
}

/**
 * Calculate duration between two timestamps
 */
function calculateDuration(start: string, end: string | null | undefined): string | undefined {
  if (!start) return undefined;
  const startTime = new Date(start).getTime();
  const endTime = end ? new Date(end).getTime() : Date.now();
  const diffMs = endTime - startTime;
  const diffSeconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(diffSeconds / 60);
  const seconds = diffSeconds % 60;
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
}

function MiniBarChart({ values }: { values: number[] }) {
  const maxValue = Math.max(...values, 1);
  return (
    <div className="flex items-end gap-1 h-12">
      {values.map((value, index) => (
        <motion.div
          key={index}
          initial={{ height: 0 }}
          animate={{ height: `${(value / maxValue) * 100}%` }}
          transition={{ delay: index * 0.1, duration: 0.5 }}
          className="w-3 bg-gradient-to-t from-primary to-primary/60 rounded-t"
        />
      ))}
    </div>
  );
}

function StepCard({ step, index, totalSteps }: { step: Step; index: number; totalSteps: number }) {
  const [isExpanded, setIsExpanded] = useState(step.status === "completed");

  const statusConfig = {
    completed: {
      bg: "bg-green-500/10 dark:bg-green-800/10",
      border: "border-green-500/50 dark:border-green-500/30",
      iconBg: "bg-green-500 text-white dark:bg-green-500/100 text-white",
      text: "text-green-500 dark:text-green-400",
    },
    active: {
      bg: "bg-primary/10",
      border: "border-primary/90",
      iconBg: "bg-primary text-primary-foreground",
      text: "text-primary",
    },
    waiting: {
      bg: "bg-muted/10 drak:bg-muted/50",
      border: "border-foreground/10 dark:border-foreground/10",
      iconBg: "bg-muted/70 dark:bg-muted",
      text: "text-muted-foreground dark:text-muted-foreground/90",
    },
  };

  const config = statusConfig[step.status];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.15, duration: 0.4 }}
      className="relative"
    >

      <motion.div
        layout
        className={cn(
          "rounded-[2rem] border-2 transition-all overflow-hidden",
          config.bg,
          config.border,
          step.status === "active" && "ring-4 ring-primary/20"
        )}
      >
        {/* Header */}
        <div
          onClick={() => step.status === "completed" && setIsExpanded(!isExpanded)}
          className="w-full p-2.5 md:p-4 flex items-center gap-2 md:gap-4"
          style={{ pointerEvents: step.status !== "completed" ? "none" : "auto", opacity: step.status !== "completed" ? 0.5 : 1 }}
        >
          {/* Status Icon */}
          <div
            className={cn(
              "w-8 h-8 md:w-12 md:h-12 rounded-lg md:rounded-[1.25rem] flex items-center justify-center flex-shrink-0",
              config.iconBg,
              step.status === "active" && "animate-pulse"
            )}
          >
            {step.status === "completed" ? (
              <FontAwesomeIcon icon={faCheck} className="w-4 h-4 md:w-6 md:h-6" />
            ) : step.status === "active" ? (
              <FontAwesomeIcon icon={faSpinner} className="w-4 h-4 md:w-6 md:h-6 animate-spin" />
            ) : (
              <FontAwesomeIcon icon={step.icon} className={cn("w-3.5 h-3.5 md:w-5 md:h-5", config.text)} />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 text-left min-w-0">
            <div className="flex items-center gap-1.5 md:gap-2 flex-wrap">
              <h3 className="font-bold text-sm md:text-base text-foreground">{step.title}</h3>
              {step.duration && (
                <span className="text-xs font-medium px-1.5 py-0.5 md:px-2 rounded-full bg-green-600/20 text-green-600 dark:text-green-400">
                  {step.duration}
                </span>
              )}
            </div>
            <p className="text-xs md:text-sm text-muted-foreground mt-0.5 line-clamp-1">{step.description}</p>

            {/* Active step dots animation */}
            {step.status === "active" && (
              <div className="flex items-center gap-1 mt-1.5 md:mt-2">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                    className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-primary"
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function ProgressTimeline({
  steps,
  completedSteps,
  currentStep,
  startedAt,
  completedAt,
  sourcesCount,
  documentsCreated,
}: ProgressTimelineProps) {
  // Build step objects with status
  const stepObjects: Step[] = steps.map((stepId, index) => {
    const isCompleted = completedSteps.includes(stepId);
    const isActive = currentStep === stepId && !isCompleted && currentStep !== "complete";
    const status: "completed" | "active" | "waiting" = isCompleted
      ? "completed"
      : isActive
      ? "active"
      : "waiting";

    // Calculate duration for completed steps
    let duration: string | undefined;
    if (isCompleted && startedAt) {
      // For completed steps, we'd need individual step timestamps
      // For now, estimate based on total time divided by steps
      if (completedAt) {
        const totalDuration = calculateDuration(startedAt, completedAt);
        if (totalDuration) {
          // Rough estimate: divide total by number of steps
          duration = totalDuration;
        }
      }
    }

    // Add stats for completed steps if available
    const stats: { label: string; value: string }[] | undefined =
      isCompleted && (sourcesCount !== undefined || documentsCreated !== undefined)
        ? [
            ...(sourcesCount !== undefined
              ? [{ label: "Sources analyzed", value: sourcesCount.toString() }]
              : []),
            ...(documentsCreated !== undefined
              ? [{ label: "Documents created", value: documentsCreated.toString() }]
              : []),
          ]
        : undefined;

    return {
      id: stepId,
      title: getStepName(stepId),
      description: getStepDescription(stepId),
      status,
      duration,
      stats,
      icon: getStepIcon(stepId),
    };
  });

  return (
    <div className="space-y-2 md:space-y-4">
      {stepObjects.map((step, index) => (
        <StepCard key={step.id} step={step} index={index} totalSteps={stepObjects.length} />
      ))}
    </div>
  );
}


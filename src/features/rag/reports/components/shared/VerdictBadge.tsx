"use client";

import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faExclamationTriangle,
  faXmarkCircle,
  faStar,
  faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";
import {
  getFitScoreCategory,
  getFitScoreColorClasses,
  getFitScoreLabel,
} from "@/features/rag/shared/utils/fitScoreColors";
import type { FitScoreCategory } from "@/features/rag/shared/utils/fitScoreColors";

interface VerdictBadgeProps {
  verdict: "pursue" | "test" | "avoid";
  nextStep?: string;
  fit_score?: number | null;
}

const categoryConfig: Record<FitScoreCategory, {
  icon: typeof faCheckCircle;
  description: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  iconColor: string;
}> = {
  ideal: {
    icon: faStar,
    description: "Exceptional fit, top priority",
    bgColor: "bg-purple-50 dark:bg-purple-950/20",
    borderColor: "border-purple-200 dark:border-purple-800",
    textColor: "text-purple-700 dark:text-purple-400",
    iconColor: "text-purple-600 dark:text-purple-400",
  },
  pursue: {
    icon: faCheckCircle,
    description: "High-confidence opportunity",
    bgColor: "bg-green-50 dark:bg-green-950/20",
    borderColor: "border-green-200 dark:border-green-800",
    textColor: "text-green-700 dark:text-green-400",
    iconColor: "text-green-600 dark:text-green-400",
  },
  test: {
    icon: faExclamationTriangle,
    description: "Worth piloting with controlled approach",
    bgColor: "bg-yellow-50 dark:bg-yellow-950/20",
    borderColor: "border-yellow-200 dark:border-yellow-800",
    textColor: "text-yellow-700 dark:text-yellow-400",
    iconColor: "text-yellow-600 dark:text-yellow-400",
  },
  caution: {
    icon: faTriangleExclamation,
    description: "Viable but significant friction, test only if desperate for niches",
    bgColor: "bg-orange-50 dark:bg-orange-950/20",
    borderColor: "border-orange-200 dark:border-orange-800",
    textColor: "text-orange-700 dark:text-orange-400",
    iconColor: "text-orange-600 dark:text-orange-400",
  },
  avoid: {
    icon: faXmarkCircle,
    description: "Low-confidence opportunity",
    bgColor: "bg-red-50 dark:bg-red-950/20",
    borderColor: "border-red-200 dark:border-red-800",
    textColor: "text-red-700 dark:text-red-400",
    iconColor: "text-red-600 dark:text-red-400",
  },
};

export const VerdictBadge = ({ verdict, nextStep, fit_score }: VerdictBadgeProps) => {
  // Determine category based on fit_score (priority) or verdict (fallback)
  const category = getFitScoreCategory(fit_score ?? null, verdict);
  const config = categoryConfig[category];
  const Icon = config.icon;
  const label = getFitScoreLabel(category);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`rounded-xl p-6 border-2 ${config.bgColor} ${config.borderColor}`}
    >
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-full ${config.bgColor}`}>
          <FontAwesomeIcon className={`w-8 h-8 ${config.iconColor}`} icon={Icon} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs uppercase tracking-wider text-muted-foreground font-body">
              Strategic Verdict
            </span>
          </div>
          <h3 className={`text-2xl font-display font-semibold ${config.textColor} mb-1`}>
            {label}
          </h3>
          <p className="text-sm text-muted-foreground font-body mb-4">
            {config.description}
          </p>
          {nextStep && (
            <div className="bg-card/50 rounded-lg p-4 border border-border">
              <span className="text-xs uppercase tracking-wider text-muted-foreground font-body block mb-2">
                Recommended Next Step
              </span>
              <p className="text-sm font-body text-foreground leading-relaxed">
                {nextStep}
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

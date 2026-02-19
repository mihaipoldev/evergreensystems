"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShieldHalved } from "@fortawesome/free-solid-svg-icons";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";

interface ConfidenceBadgeProps {
  value: number;
  label?: string;
  icon?: ReactNode;
  variant?: "default" | "success" | "warning";
  rationale?: string;
}

export const ConfidenceBadge = ({
  value,
  label = "Confidence",
  icon,
  variant = "default",
  rationale,
}: ConfidenceBadgeProps) => {
  const displayValue = value <= 1 ? (value * 100).toFixed(0) : value.toFixed(0);
  const variants = {
    default: "bg-primary/10 border-primary/20 text-primary",
    success: "bg-green-500/10 border-green-500/20 text-green-600 dark:text-green-400",
    warning: "bg-yellow-500/10 border-yellow-500/20 text-yellow-600 dark:text-yellow-400",
  };
  const iconNode = icon ?? <FontAwesomeIcon icon={faShieldHalved} className="w-3.5 h-3.5" />;

  const badge = (
    <div
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${variants[variant]} ${rationale ? "cursor-help" : ""}`}
    >
      {iconNode}
      <span className="text-sm font-semibold">
        {displayValue}% {label}
      </span>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex justify-center mb-6"
    >
      {rationale ? (
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-block">{badge}</span>
            </TooltipTrigger>
            <TooltipContent
              side="bottom"
              className="max-w-sm p-4 text-sm text-foreground"
            >
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-1.5">
                Confidence Rationale
              </p>
              <p className="leading-relaxed">{rationale}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        badge
      )}
    </motion.div>
  );
};

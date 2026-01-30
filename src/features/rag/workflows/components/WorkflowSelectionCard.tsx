"use client";

import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock, faArrowRight, faCog } from "@fortawesome/free-solid-svg-icons";
import { cn } from "@/lib/utils";
import { resolveIconFromClass } from "@/lib/icon-utils";
import type { Workflow } from "../types";

interface WorkflowSelectionCardProps {
  workflow: Workflow;
  isSelected: boolean;
  onSelect: () => void;
  onConfigClick?: () => void;
}

/**
 * WorkflowSelectionCard - A bold, animated card component for selecting report workflows
 * Features gradient borders, hover effects, and smooth expand animations
 */
export function WorkflowSelectionCard({
  workflow,
  isSelected,
  onSelect,
  onConfigClick,
}: WorkflowSelectionCardProps) {
  // Format price
  const price = workflow.estimated_cost
    ? `$${workflow.estimated_cost.toFixed(2)}`
    : "Free";

  // Format time
  const time = workflow.estimated_time_minutes
    ? `~${workflow.estimated_time_minutes} minutes`
    : "~10 minutes";

  // Resolve icon
  let iconElement = null;
  if (workflow.icon) {
    const icon = resolveIconFromClass(workflow.icon);
    if (icon) {
      iconElement = <FontAwesomeIcon icon={icon} className="text-xl" />;
    } else {
      // Fallback to emoji if Font Awesome icon not found
      iconElement = <span className="text-2xl">{workflow.icon}</span>;
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={!isSelected ? { scale: 1.02, y: -4 } : {}}
      transition={{ duration: 0.01, ease: "easeOut" }}
      onClick={onSelect}
      className={cn(
        "relative cursor-pointer rounded-2xl border-2 transition-all duration-300",
        "bg-card hover:border-primary/50",
        isSelected
          ? "border-primary ring-4 ring-primary/20"
          : "border-border hover:shadow-xl"
      )}
      style={{
        boxShadow: isSelected
          ? "0 12px 40px -8px hsl(var(--primary) / 0.35)"
          : undefined,
      }}
    >
      {/* Price Badge - Top Right */}
      <div className="absolute -top-2 -right-2 z-10">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 400 }}
          className="bg-primary text-primary-foreground px-2.5 py-1 rounded-full shadow-lg"
        >
          <span className="text-xs font-bold">{price}</span>
        </motion.div>
      </div>

      {/* Config Button - Top Right (only when selected) */}
      {isSelected && onConfigClick && (
        <div className="absolute top-6 right-3 z-10">
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 400 }}
            onClick={(e) => {
              e.stopPropagation();
              onConfigClick();
            }}
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-all",
              "bg-secondary hover:bg-secondary/80 text-foreground",
              "hover:scale-110 active:scale-95"
            )}
          >
            <FontAwesomeIcon icon={faCog} className="w-3.5 h-3.5" />
          </motion.button>
        </div>
      )}

      <div className="p-4">
        {/* Icon */}
        <motion.div
          className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center mb-3",
            "bg-secondary"
          )}
          whileHover={{ rotate: [0, -5, 5, 0] }}
          transition={{ duration: 0.5 }}
        >
          {iconElement || (
            <FontAwesomeIcon
              icon={faArrowRight}
              className="text-xl text-primary"
            />
          )}
        </motion.div>

        {/* Title */}
        <h3 className="text-lg font-bold text-foreground mb-1.5">
          {workflow.name}
        </h3>

        {/* Description */}
        <p className="text-muted-foreground text-sm leading-relaxed mb-3 line-clamp-2">
          {workflow.description || "No description available"}
        </p>

        {/* Time Badge */}
        <div className="flex items-center gap-2 text-muted-foreground mb-3">
          <FontAwesomeIcon icon={faClock} className="w-3.5 h-3.5" />
          <span className="text-xs font-medium">{time}</span>
        </div>

        {/* Select Button */}
        <motion.button
          className={cn(
            "w-full py-2 px-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all",
            isSelected
              ? "bg-primary text-primary-foreground"
              : "bg-muted/50 text-foreground hover:bg-muted/70"
          )}
        >
          {isSelected ? "Selected" : "Select"}
          <FontAwesomeIcon icon={faArrowRight} className="w-3.5 h-3.5" />
        </motion.button>
      </div>
    </motion.div>
  );
}


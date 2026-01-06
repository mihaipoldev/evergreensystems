"use client";

import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { cn } from "@/lib/utils";
import { resolveIconFromClass } from "@/lib/icon-utils";
import type { Workflow } from "../types";

interface WorkflowSelectionCardProps {
  workflow: Workflow;
  isSelected: boolean;
  onSelect: () => void;
}

/**
 * WorkflowSelectionCard - A bold, animated card component for selecting report workflows
 * Features gradient borders, hover effects, and smooth expand animations
 */
export function WorkflowSelectionCard({
  workflow,
  isSelected,
  onSelect,
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
      iconElement = <FontAwesomeIcon icon={icon} className="text-2xl" />;
    } else {
      // Fallback to emoji if Font Awesome icon not found
      iconElement = <span className="text-3xl">{workflow.icon}</span>;
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={!isSelected ? { scale: 1.02, y: -4 } : {}}
      transition={{ duration: 0.3, ease: "easeOut" }}
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
      <div className="absolute -top-3 -right-3 z-10">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 400 }}
          className="bg-primary text-primary-foreground px-4 py-1.5 rounded-full shadow-lg"
        >
          <span className="text-sm font-bold">{price}</span>
        </motion.div>
      </div>

      <div className="p-6">
        {/* Icon */}
        <motion.div
          className={cn(
            "w-16 h-16 rounded-xl flex items-center justify-center mb-4",
            "bg-gradient-to-br from-primary/10 to-secondary/10"
          )}
          whileHover={{ rotate: [0, -5, 5, 0] }}
          transition={{ duration: 0.5 }}
        >
          {iconElement || (
            <FontAwesomeIcon
              icon={faArrowRight}
              className="text-2xl text-primary"
            />
          )}
        </motion.div>

        {/* Title */}
        <h3 className="text-xl font-bold text-foreground mb-2">
          {workflow.label}
        </h3>

        {/* Description */}
        <p className="text-muted-foreground text-sm leading-relaxed mb-4 line-clamp-2">
          {workflow.description || "No description available"}
        </p>

        {/* Time Badge */}
        <div className="flex items-center gap-2 text-muted-foreground mb-4">
          <FontAwesomeIcon icon={faClock} className="w-4 h-4" />
          <span className="text-sm font-medium">{time}</span>
        </div>

        {/* Select Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={cn(
            "w-full py-3 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all",
            isSelected
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-foreground hover:bg-muted/80"
          )}
        >
          {isSelected ? "Selected" : "Select"}
          <FontAwesomeIcon icon={faArrowRight} className="w-4 h-4" />
        </motion.button>
      </div>
    </motion.div>
  );
}


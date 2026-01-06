"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

// Helper function to extract text from string, number, or object
const getValueText = (value: string | number | Record<string, any> | null | undefined): string => {
  if (value === null || value === undefined) {
    return "Unknown";
  }
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }
  // If it's an object, try common property names
  return (
    value.value ||
    value.label ||
    value.name ||
    value.text ||
    value.market_maturity ||
    value.category ||
    value.competitive_intensity ||
    JSON.stringify(value)
  );
};

interface StatCardProps {
  label: string;
  value: string | number | Record<string, any> | null | undefined;
  icon?: ReactNode;
  description?: string;
  variant?: "default" | "highlight" | "muted";
}

export const StatCard = ({
  label,
  value,
  icon,
  description,
  variant = "default",
}: StatCardProps) => {
  const variants = {
    default: "bg-card border-border",
    highlight: "bg-primary text-primary-foreground border-primary",
    muted: "bg-muted border-border",
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={`rounded-lg p-5 border report-shadow ${variants[variant]}`}
    >
      <div className="flex items-start justify-between mb-3">
        <span
          className={`text-xs uppercase tracking-wider font-body ${
            variant === "highlight" ? "text-primary-foreground/70" : "text-muted-foreground"
          }`}
        >
          {label}
        </span>
        {icon && (
          <span
            className={
              variant === "highlight" ? "text-primary-foreground/70" : "text-accent"
            }
          >
            {icon}
          </span>
        )}
      </div>
      <p
        className={`text-2xl font-display font-semibold mb-1 ${
          variant === "highlight" ? "text-primary-foreground" : "text-foreground"
        }`}
      >
        {getValueText(value)}
      </p>
      {description && (
        <p
          className={`text-sm font-body ${
            variant === "highlight" ? "text-primary-foreground/80" : "text-muted-foreground"
          }`}
        >
          {description}
        </p>
      )}
    </motion.div>
  );
};


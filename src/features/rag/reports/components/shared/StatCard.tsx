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

export type StatCardVariant =
  | "default"
  | "accent"
  | "primary"
  | "green"
  | "warning"
  | "danger"
  | "muted"
  | "highlight"
  | "ideal"
  | "caution"
  | "green-dimmed"
  | "warning-dimmed"
  | "danger-dimmed"
  | "ideal-dimmed"
  | "caution-dimmed";

interface StatCardProps {
  label: string;
  value: string | number | Record<string, any> | null | undefined;
  icon?: ReactNode;
  description?: string;
  variant?: StatCardVariant;
  /** Optional badge (e.g. Pursue/Avoid) shown next to the value */
  badge?: ReactNode;
  /** Optional Tailwind text color classes for icon and value only (e.g. "text-green-600 dark:text-green-400"). Used when variant is default. */
  iconValueColor?: string;
}

const variantClasses: Record<Exclude<StatCardVariant, "highlight">, string> = {
  default: "bg-card border-border",
  accent: "bg-accent/10 text-accent border-accent/20",
  primary: "bg-primary text-primary-foreground border-primary",
  green: "bg-green-500/10 text-green-700 dark:text-green-300 border-green-500/20 dark:border-green-400/20",
  warning: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-300 border-yellow-500/20 dark:border-yellow-400/20",
  danger: "bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/20 dark:border-red-400/20",
  muted: "bg-muted border-border",
  ideal: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20 dark:border-emerald-400/20",
  caution: "bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-500/20 dark:border-orange-400/20",
  "green-dimmed": "bg-green-500/5 text-green-600/90 dark:text-green-400/80 border-green-500/10 dark:border-green-400/10",
  "warning-dimmed": "bg-yellow-500/5 text-yellow-600/90 dark:text-yellow-400/80 border-yellow-500/10 dark:border-yellow-400/10",
  "danger-dimmed": "bg-red-500/5 text-red-600/90 dark:text-red-400/80 border-red-500/10 dark:border-red-400/10",
  "ideal-dimmed": "bg-emerald-500/5 text-emerald-600/90 dark:text-emerald-400/80 border-emerald-500/10 dark:border-emerald-400/10",
  "caution-dimmed": "bg-orange-500/5 text-orange-600/90 dark:text-orange-400/80 border-orange-500/10 dark:border-orange-400/10",
};

const isHighlightVariant = (v: StatCardVariant) =>
  v === "primary" ||
  v === "highlight" ||
  v === "accent" ||
  v === "green" ||
  v === "warning" ||
  v === "danger" ||
  v === "ideal" ||
  v === "caution" ||
  v === "green-dimmed" ||
  v === "warning-dimmed" ||
  v === "danger-dimmed" ||
  v === "ideal-dimmed" ||
  v === "caution-dimmed";

export const StatCard = ({
  label,
  value,
  icon,
  description,
  variant = "default",
  badge,
  iconValueColor,
}: StatCardProps) => {
  const resolvedVariant = variant === "highlight" ? "primary" : variant;
  const highlighted = isHighlightVariant(variant);
  const labelClass = highlighted ? "text-current/70" : "text-muted-foreground";
  const iconClass = highlighted
    ? "text-current/70"
    : iconValueColor
      ? iconValueColor
      : "text-accent";
  const valueClass = highlighted
    ? "text-current"
    : iconValueColor
      ? iconValueColor
      : "text-foreground";
  const descClass = highlighted ? "text-current/80" : "text-muted-foreground";

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={`rounded-lg p-5 border report-shadow ${variantClasses[resolvedVariant]}`}
    >
      <div className="flex items-start justify-between mb-3">
        <span className={`text-xs uppercase tracking-wider font-body ${labelClass}`}>
          {label}
        </span>
        {icon && <span className={iconClass}>{icon}</span>}
      </div>
      <div className="flex flex-wrap items-baseline gap-2 mb-1">
        <p className={`text-2xl font-display font-semibold ${valueClass}`}>
          {getValueText(value)}
        </p>
        {badge}
      </div>
      {description && (
        <p className={`text-sm font-body ${descClass}`}>
          {description}
        </p>
      )}
    </motion.div>
  );
};

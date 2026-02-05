"use client";

import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faExclamationTriangle,
  faInfoCircle,
  faBullseye,
} from "@fortawesome/free-solid-svg-icons";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";

export type InsightListType =
  | "default"
  | "accent"
  | "primary"
  | "green"
  | "warning"
  | "danger"
  | "info"
  | "success"
  | "target"
  | "critical";

// Helper function to extract text from string or object
const getItemText = (item: string | Record<string, any> | null | undefined): string => {
  if (item == null) return "";
  if (typeof item === "string") return item;
  return (
    item.text ??
    item.label ??
    item.name ??
    item.value ??
    item.description ??
    ""
  ) || JSON.stringify(item);
};

interface InsightListProps {
  items: (string | Record<string, any> | null | undefined)[];
  type?: InsightListType;
  numbered?: boolean;
}

const iconMap: Record<InsightListType, IconDefinition> = {
  default: faInfoCircle,
  accent: faBullseye,
  primary: faBullseye,
  green: faCheck,
  warning: faExclamationTriangle,
  danger: faExclamationTriangle,
  info: faInfoCircle,
  success: faCheck,
  target: faBullseye,
  critical: faExclamationTriangle,
};

const colorMap: Record<Exclude<InsightListType, "success" | "target" | "critical">, string> = {
  default: "text-muted-foreground bg-muted/50 border-border",
  accent: "text-accent dark:text-accent bg-accent/10 dark:bg-accent/20 border-accent/20 dark:border-accent/30",
  primary: "text-primary bg-primary/10 border-primary/20",
  green: "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800",
  warning: "text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800",
  danger: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800",
  info: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800",
};

function resolveType(type: InsightListType): Exclude<InsightListType, "success" | "target" | "critical"> {
  if (type === "success") return "green";
  if (type === "target") return "accent";
  if (type === "critical") return "danger";
  return type;
}

export const InsightList = ({
  items,
  type = "info",
  numbered = false,
}: InsightListProps) => {
  const resolvedType = resolveType(type);
  const icon = iconMap[type];
  const colorClass = colorMap[resolvedType];

  const validItems = items.filter(
    (item): item is string | Record<string, any> => item != null && item !== ""
  );

  return (
    <ul className="space-y-3">
      {validItems.map((item, index) => (
        <motion.li
          key={index}
          initial={{ opacity: 0, x: -10 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.05 }}
          className={`flex items-start gap-3 p-3 rounded-md border ${colorClass}`}
        >
          <div className="flex-shrink-0 mt-0.5">
            {numbered ? (
              <span className="w-5 h-5 rounded-full bg-current/20 flex items-center justify-center text-xs font-semibold">
                {index + 1}
              </span>
            ) : (
              <FontAwesomeIcon icon={icon} className="w-4 h-4" />
            )}
          </div>
          <span className="text-sm font-body leading-relaxed text-foreground">
            {getItemText(item)}
          </span>
        </motion.li>
      ))}
    </ul>
  );
};

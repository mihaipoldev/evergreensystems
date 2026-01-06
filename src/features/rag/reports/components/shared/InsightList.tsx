"use client";

import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faCheck, 
  faExclamationTriangle, 
  faInfoCircle, 
  faBullseye 
} from "@fortawesome/free-solid-svg-icons";

type InsightType = "success" | "warning" | "info" | "target";

// Helper function to extract text from string or object
const getItemText = (item: string | Record<string, any>): string => {
  if (typeof item === "string") {
    return item;
  }
  // If it's an object, try common property names
  return (
    item.text ||
    item.label ||
    item.name ||
    item.value ||
    item.description ||
    JSON.stringify(item)
  );
};

interface InsightListProps {
  items: (string | Record<string, any>)[];
  type?: InsightType;
  numbered?: boolean;
}

const iconMap = {
  success: faCheck,
  warning: faExclamationTriangle,
  info: faInfoCircle,
  target: faBullseye,
};

const colorMap = {
  success: "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800",
  warning: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800",
  info: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800",
  target: "text-accent dark:text-accent bg-accent/10 dark:bg-accent/20 border-accent/20 dark:border-accent/30",
};

export const InsightList = ({
  items,
  type = "info",
  numbered = false,
}: InsightListProps) => {
  const icon = iconMap[type];

  return (
    <ul className="space-y-3">
      {items.map((item, index) => (
        <motion.li
          key={index}
          initial={{ opacity: 0, x: -10 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.05 }}
          className={`flex items-start gap-3 p-3 rounded-md border ${colorMap[type]}`}
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


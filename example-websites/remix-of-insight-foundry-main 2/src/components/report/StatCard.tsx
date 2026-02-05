import { motion } from "framer-motion";
import { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: string | number;
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
        {value}
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

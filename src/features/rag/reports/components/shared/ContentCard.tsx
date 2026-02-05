"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

/** Second styling knob: "summary" = muted label title (e.g. Summary, Timing cards); "default" = strong label. All title styling is resolved inside the component. */
export type ContentCardStyle = "summary" | "default";

interface ContentCardProps {
  title?: string;
  icon?: ReactNode;
  subtitle?: string;
  titleVariant?: "label" | "title";
  variant?: ContentCardVariant;
  style?: ContentCardStyle;
  children?: ReactNode;
}

export type ContentCardVariant = "default" | "muted" | "primary" | "accent" | "green" | "warning" | "danger" | "success";

const variantStyles: Record<Exclude<ContentCardVariant, "success">, { card: string; title: string; subtitle: string; body: string }> = {
  default: {
    card: "bg-card border-border report-shadow",
    title: "text-foreground",
    subtitle: "text-muted-foreground",
    body: "text-foreground",
  },
  muted: {
    card: "bg-muted/50 border-border",
    title: "text-foreground",
    subtitle: "text-muted-foreground",
    body: "text-foreground",
  },
  primary: {
    card: "bg-primary border-primary text-primary-foreground",
    title: "text-primary-foreground",
    subtitle: "text-primary-foreground/80",
    body: "text-primary-foreground",
  },
  accent: {
    card: "bg-accent/10 border-accent/20",
    title: "text-foreground",
    subtitle: "text-muted-foreground",
    body: "text-foreground",
  },
  green: {
    card: "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800",
    title: "text-foreground",
    subtitle: "text-muted-foreground",
    body: "text-foreground",
  },
  warning: {
    card: "bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800",
    title: "text-foreground",
    subtitle: "text-muted-foreground",
    body: "text-foreground",
  },
  danger: {
    card: "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800",
    title: "text-foreground",
    subtitle: "text-muted-foreground",
    body: "text-foreground",
  },
};

export const ContentCard = ({
  title,
  icon,
  subtitle,
  titleVariant = "label",
  variant = "default",
  style: cardStyle = "default",
  children,
}: ContentCardProps) => {
  const resolvedVariant = variant === "success" ? "green" : variant;
  const styles = variantStyles[resolvedVariant];
  const labelTitleMuted = cardStyle === "summary" && titleVariant === "label";
  const labelTitleClass =
    titleVariant === "label"
      ? labelTitleMuted
        ? "text-sm uppercase tracking-wider font-body text-muted-foreground"
        : `text-sm uppercase tracking-wider font-body ${styles.title}`
      : "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`rounded-xl p-6 border ${styles.card}`}
    >
      {(title || icon) && (
        <div className="flex items-center gap-2 mb-4">
          {icon && (
            <span className={resolvedVariant === "primary" ? "text-accent" : "text-accent"}>
              {icon}
            </span>
          )}
          {title && (
            titleVariant === "title" ? (
              <h4 className={`text-lg font-display font-semibold ${styles.title}`}>
                {title}
              </h4>
            ) : (
              <h4 className={labelTitleClass}>
                {title}
              </h4>
            )
          )}
        </div>
      )}
      {subtitle && (
        <p className={`text-sm font-body mb-4 ${styles.subtitle}`}>
          {subtitle}
        </p>
      )}
      <div className={`font-body leading-relaxed ${styles.body}`}>
        {children ?? null}
      </div>
    </motion.div>
  );
};

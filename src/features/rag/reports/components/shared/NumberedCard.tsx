"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface NumberedCardProps {
  number: number;
  children?: ReactNode;
  description?: string;
  layout?: "stacked" | "inline";
}

export const NumberedCard = ({
  number,
  children,
  description,
  layout = "stacked",
}: NumberedCardProps) => {
  const content = children ?? (description && <p className="text-sm font-body font-medium text-foreground">{description}</p>);

  if (layout === "inline") {
    return (
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        className="bg-card rounded-lg p-4 border border-border report-shadow flex items-start gap-4"
      >
        <span className="w-6 h-6 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-xs font-semibold flex-shrink-0">
          {number}
        </span>
        <div className="min-w-0 flex-1">{content}</div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-card rounded-lg p-4 border border-border text-center report-shadow hover:border-accent transition-colors"
    >
      <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-accent/10 flex items-center justify-center text-accent font-display font-semibold text-sm">
        {number}
      </div>
      {content}
    </motion.div>
  );
};

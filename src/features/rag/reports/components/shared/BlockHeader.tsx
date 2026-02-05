"use client";

import { ReactNode } from "react";

interface BlockHeaderProps {
  title: string;
  icon?: ReactNode;
  subtitle?: string;
  variant?: "label" | "title";
}

export const BlockHeader = ({
  title,
  icon,
  subtitle,
  variant = "title",
}: BlockHeaderProps) => {
  if (variant === "label") {
    return (
      <h4 className="text-sm uppercase tracking-wider text-muted-foreground font-body mb-3 md:mb-4">
        {title}
      </h4>
    );
  }

  return (
    <div className="mb-4">
      <h4 className="text-lg font-display font-semibold text-foreground flex items-center gap-2">
        {icon}
        {title}
      </h4>
      {subtitle && (
        <p className="text-sm text-muted-foreground font-body mt-1">{subtitle}</p>
      )}
    </div>
  );
};

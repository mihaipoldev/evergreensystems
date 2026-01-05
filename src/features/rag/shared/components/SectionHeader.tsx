"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { ReactNode } from "react";

interface SectionHeaderProps {
  title: string;
  description?: string;
  icon?: IconDefinition;
  action?: ReactNode;
}

export function SectionHeader({
  title,
  description,
  icon,
  action,
}: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        {icon && (
          <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center">
            <FontAwesomeIcon
              icon={icon}
              className="h-4 w-4 text-primary"
            />
          </div>
        )}
        <div>
          <h2 className="text-base font-semibold text-foreground">{title}</h2>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      {action}
    </div>
  );
}


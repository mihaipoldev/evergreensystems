"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { resolveIconFromRegistry } from "@/lib/icon-registry";
import { cn } from "@/lib/utils";

type FontAwesomeIconFromClassProps = {
  iconClass: string | null | undefined;
  fallbackIcon?: IconDefinition;
  className?: string;
};

/**
 * Converts Font Awesome class name (e.g., "fa-pen") to Font Awesome icon object
 * and renders it. Falls back to a default icon if the class name is not found.
 */
export function FontAwesomeIconFromClass({
  iconClass,
  fallbackIcon,
  className,
}: FontAwesomeIconFromClassProps) {
  // If no icon class is provided, use fallback or return null
  if (!iconClass) {
    if (fallbackIcon) {
      return (
        <span className="inline-flex" suppressHydrationWarning>
          <FontAwesomeIcon icon={fallbackIcon} className={className} />
        </span>
      );
    }
    return null;
  }

  // Use the curated icon registry instead of importing all icons
  // This dramatically improves build performance
  const icon = resolveIconFromRegistry(iconClass);

  if (icon) {
    return (
      <span className="inline-flex" suppressHydrationWarning>
        <FontAwesomeIcon icon={icon} className={className} />
      </span>
    );
  }

  // Fallback to provided fallback icon or null
  if (fallbackIcon) {
    return (
      <span className="inline-flex" suppressHydrationWarning>
        <FontAwesomeIcon icon={fallbackIcon} className={className} />
      </span>
    );
  }

  return null;
}

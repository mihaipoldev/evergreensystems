"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import * as Icons from "@fortawesome/free-solid-svg-icons";
import {
  faBullseye,
  faComments,
  faHandshake,
  faGaugeHigh,
  faSliders,
  faWandMagicSparkles,
  faCheckCircle,
  faShieldAlt,
} from "@fortawesome/free-solid-svg-icons";
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

  // Icon mapping for Pro icons and special cases
  // Maps icon class names to their Font Awesome icon definitions
  const iconMap: Record<string, IconDefinition> = {
    // Pro icons mapped to free alternatives
    'fa-badge-check': faCheckCircle,
    'badge-check': faCheckCircle,
    'badge': faCheckCircle,
    'fa-shield-check': faShieldAlt,
    'shield-check': faShieldAlt,
    // New icons we added
    'fa-bullseye': faBullseye,
    'bullseye': faBullseye,
    'fa-comments': faComments,
    'comments': faComments,
    'fa-handshake': faHandshake,
    'handshake': faHandshake,
    'fa-gauge-high': faGaugeHigh,
    'gauge-high': faGaugeHigh,
    'gauge': faGaugeHigh,
    'fa-sliders': faSliders,
    'sliders': faSliders,
    'fa-wand-magic-sparkles': faWandMagicSparkles,
    'wand-magic-sparkles': faWandMagicSparkles,
    'wand-magic': faWandMagicSparkles,
    'wand': faWandMagicSparkles,
    'magic': faWandMagicSparkles,
  };

  // Normalize the icon class name
  // Font Awesome React icons are named like: faPen, faPencil, faPenToSquare, etc.
  // Database might have: "fa-pen", "pen", "fa-pen-to-square", etc.
  let iconName = iconClass.trim().toLowerCase();
  
  // Check icon map first (for Pro icon alternatives and new icons)
  if (iconMap[iconName]) {
    const icon = iconMap[iconName];
    return (
      <span className="inline-flex" suppressHydrationWarning>
        <FontAwesomeIcon icon={icon} className={className} />
      </span>
    );
  }
  
  // Remove "fa-" prefix if present
  if (iconName.startsWith("fa-")) {
    iconName = iconName.substring(3);
  }
  
  // Remove leading "fa" if present (e.g., "fapen" -> "pen")
  if (iconName.startsWith("fa") && iconName.length > 2) {
    iconName = iconName.substring(2);
  }
  
  // Convert kebab-case to camelCase (e.g., "pen-to-square" -> "penToSquare")
  iconName = iconName.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
  
  // Capitalize first letter for Font Awesome naming convention
  const capitalizedName = iconName.charAt(0).toUpperCase() + iconName.slice(1);
  
  // Try to find the icon in Font Awesome icons
  // Font Awesome icons are named like: faPen, faPencil, faPenToSquare, etc.
  const iconKey = `fa${capitalizedName}` as keyof typeof Icons;
  
  const icon = Icons[iconKey] as IconDefinition | undefined;

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

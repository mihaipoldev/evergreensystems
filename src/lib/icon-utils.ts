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

/**
 * Icon mapping for Pro icons and special cases
 * Maps icon class names to their Font Awesome icon definitions
 */
const iconMap: Record<string, IconDefinition> = {
  // Pro icons mapped to free alternatives
  'fa-badge-check': faCheckCircle,
  'badge-check': faCheckCircle,
  'badge': faCheckCircle,
  'fa-shield-check': faShieldAlt,
  'shield-check': faShieldAlt,
  // Common icons
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

/**
 * Resolves an icon class name (string) to a Font Awesome IconDefinition
 * Handles formats like "fa-pen", "pen", "fa-pen-to-square", etc.
 * Returns the IconDefinition if found, or null if not found
 */
export function resolveIconFromClass(
  iconClass: string | null | undefined
): IconDefinition | null {
  // If no icon class is provided, return null
  if (!iconClass) {
    return null;
  }

  // Normalize the icon class name
  let iconName = iconClass.trim().toLowerCase();
  
  // Check icon map first (for Pro icon alternatives and special cases)
  if (iconMap[iconName]) {
    return iconMap[iconName];
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

  if (icon && typeof icon === 'object' && 'icon' in icon) {
    return icon as IconDefinition;
  }

  return null;
}

import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { resolveIconFromRegistry } from "./icon-registry";

/**
 * Resolves an icon class name (string) to a Font Awesome IconDefinition
 * Handles formats like "fa-pen", "pen", "fa-pen-to-square", etc.
 * Returns the IconDefinition if found, or null if not found
 * 
 * NOTE: This now uses a curated icon registry instead of importing ALL icons
 * to dramatically improve build performance. If you need a new icon, add it to
 * src/lib/icon-registry.ts
 */
export function resolveIconFromClass(
  iconClass: string | null | undefined
): IconDefinition | null {
  // Use the curated registry - this avoids importing thousands of icons
  return resolveIconFromRegistry(iconClass);
}

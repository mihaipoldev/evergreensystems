/**
 * Utility functions for persisting collapsible/accordion group state in localStorage
 * Used for research reports and other collapsible sections
 */

const COLLAPSIBLE_STORAGE_PREFIX = "collapsible-state-";

/**
 * Get the stored open/collapsed state for a collapsible group
 * @param groupId - Unique identifier for the collapsible group
 * @param defaultValue - Default state if not found in storage (default: false/closed)
 * @returns true if open, false if closed
 */
export function getStoredCollapsibleState(
  groupId: string,
  defaultValue: boolean = false
): boolean {
  if (typeof window === "undefined") return defaultValue;
  
  const stored = localStorage.getItem(`${COLLAPSIBLE_STORAGE_PREFIX}${groupId}`);
  if (stored === null) return defaultValue;
  
  return stored === "true";
}

/**
 * Set the stored open/collapsed state for a collapsible group
 * @param groupId - Unique identifier for the collapsible group
 * @param isOpen - true if open, false if closed
 */
export function setStoredCollapsibleState(
  groupId: string,
  isOpen: boolean
): void {
  if (typeof window === "undefined") return;
  
  localStorage.setItem(
    `${COLLAPSIBLE_STORAGE_PREFIX}${groupId}`,
    isOpen ? "true" : "false"
  );
}

/**
 * Generate a unique group ID for research report sections
 * @param reportId - The report/run ID
 * @param sectionName - The section name (e.g., "sources-used", "research-links")
 * @returns A unique group ID
 */
export function getReportGroupId(reportId: string, sectionName: string): string {
  return `report-${reportId}-${sectionName}`;
}


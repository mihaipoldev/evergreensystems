import { HEADER_MAP } from "../../registry";
import type { HeaderConfig } from "../../types/meta";

export type { HeaderConfig };

const DEFAULT_HEADER: HeaderConfig = {
  reportTypeLabel: "Report",
  modeLabel: "Analysis Mode",
  subtitle: "Comprehensive Analysis Report",
  showStatsCards: false,
};

/**
 * Get header configuration for an automation.
 *
 * Looks up the centralized HEADER_MAP from the automation registry.
 * Falls back to a default config if not found.
 */
export function getHeaderConfigForWorkflow(nameOrSlug: string | null): HeaderConfig {
  if (!nameOrSlug) return DEFAULT_HEADER;

  // Try direct lookup (automation_name, kebab-case)
  if (HEADER_MAP[nameOrSlug]) {
    return HEADER_MAP[nameOrSlug];
  }

  // Try converting from snake_case to kebab-case
  const kebab = nameOrSlug.toLowerCase().replace(/_/g, "-").replace(/\s+/g, "-").trim();
  if (HEADER_MAP[kebab]) {
    return HEADER_MAP[kebab];
  }

  // Generate from name
  const displayName = nameOrSlug
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
  return {
    ...DEFAULT_HEADER,
    reportTypeLabel: `${displayName} Report`,
  };
}

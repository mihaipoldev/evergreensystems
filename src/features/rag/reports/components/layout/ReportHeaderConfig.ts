/**
 * Header configuration for different workflow types
 * 
 * This maps workflow names to their header configurations.
 * Each workflow can have:
 * - reportTypeLabel: The report type shown in the top bar (e.g., "Niche Intelligence Report")
 * - modeLabel: The mode/subtitle shown under report type (e.g., "Lead Generation Targeting Mode")
 * - subtitle: The main subtitle under the title (e.g., "Comprehensive Market Intelligence...")
 * - showStatsCards: Whether to show the stats cards (Geography, TAM, Fit Score, etc.)
 */

export type HeaderConfig = {
  reportTypeLabel: string;
  modeLabel: string;
  subtitle: string;
  showStatsCards: boolean;
};

export const WORKFLOW_HEADER_CONFIG: Record<string, HeaderConfig> = {
  niche_intelligence: {
    reportTypeLabel: "Niche Intelligence Report",
    modeLabel: "Lead Generation Targeting Mode",
    subtitle: "Comprehensive Market Intelligence & Strategic Targeting Analysis",
    showStatsCards: true,
  },
  descriptive_intelligence: {
    reportTypeLabel: "Niche Intelligence Report",
    modeLabel: "Descriptive Intelligence Mode",
    subtitle: "Comprehensive Market Intelligence & Niche Analysis",
    showStatsCards: true,
  },
  niche_fit_evaluation: {
    reportTypeLabel: "Niche Evaluation Report",
    modeLabel: "Strategic Assessment Mode",
    subtitle: "Detailed Niche Analysis & Opportunity Evaluation",
    showStatsCards: false,
  },
  icp_research: {
    reportTypeLabel: "ICP Research Report",
    modeLabel: "Customer Research Mode",
    subtitle: "Ideal Customer Profile & Buyer Intelligence",
    showStatsCards: false,
  },
  outbound_strategy: {
    reportTypeLabel: "Outbound Strategy Report",
    modeLabel: "Lead Gen Targeting Mode",
    subtitle: "Comprehensive Outbound Sales Strategy & Targeting Playbook",
    showStatsCards: true,
  },
  lead_gen_targeting: {
    reportTypeLabel: "Outbound Strategy Report",
    modeLabel: "Lead Gen Targeting Mode",
    subtitle: "Comprehensive Outbound Sales Strategy & Targeting Playbook",
    showStatsCards: true,
  },
};

/** Normalize workflow slug for lookup (lowercase, hyphens and spaces -> underscores). */
function normalizeSlug(slug: string | null): string | null {
  if (!slug || typeof slug !== "string") return null;
  return slug.toLowerCase().replace(/-/g, "_").replace(/\s+/g, "_").trim() || null;
}

/**
 * Get header configuration for a workflow.
 * Falls back to a default config if workflow is not found.
 */
export function getHeaderConfigForWorkflow(workflowName: string | null): HeaderConfig {
  const slug = normalizeSlug(workflowName);
  if (!slug) {
    return {
      reportTypeLabel: "Report",
      modeLabel: "Analysis Mode",
      subtitle: "Comprehensive Analysis Report",
      showStatsCards: false,
    };
  }

  return (
    WORKFLOW_HEADER_CONFIG[slug] || {
      reportTypeLabel: slug.split("_").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ") + " Report",
      modeLabel: "Analysis Mode",
      subtitle: "Comprehensive Analysis Report",
      showStatsCards: false,
    }
  );
}


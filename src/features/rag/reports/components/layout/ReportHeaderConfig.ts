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
  niche_fit_evaluation: {
    reportTypeLabel: "Niche Evaluation Report",
    modeLabel: "Strategic Assessment Mode",
    subtitle: "Detailed Niche Analysis & Opportunity Evaluation",
    showStatsCards: false, // Evaluation reports might not need these stats
  },
  // Add more workflow configurations here
};

/**
 * Get header configuration for a workflow
 * Falls back to a default config if workflow is not found
 */
export function getHeaderConfigForWorkflow(workflowName: string | null): HeaderConfig {
  if (!workflowName) {
    return {
      reportTypeLabel: "Report",
      modeLabel: "Analysis Mode",
      subtitle: "Comprehensive Analysis Report",
      showStatsCards: false,
    };
  }

  return (
    WORKFLOW_HEADER_CONFIG[workflowName] || {
      reportTypeLabel: workflowName.split("_").map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(" ") + " Report",
      modeLabel: "Analysis Mode",
      subtitle: "Comprehensive Analysis Report",
      showStatsCards: false,
    }
  );
}


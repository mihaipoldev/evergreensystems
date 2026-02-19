import type { BaseReportData, ReportSection } from "../../types/meta";

/** Data shape for icp-research / customer-intelligence reports */
export type ICPResearchData = {
  buyer_icp?: {
    snapshot?: Record<string, unknown>;
    triggers?: unknown;
    buying_committee?: unknown;
    purchase_journey?: unknown;
    segments?: {
      primary?: unknown[];
      secondary?: unknown[];
      avoid?: unknown[];
      assignment_logic?: { method?: string; rules?: unknown[] };
    };
    competitive_context?: unknown;
  };
  ops_outputs?: unknown;
  monitoring_alerts?: unknown;
  market_sizing?: unknown;
  typical_customer_types?: unknown;
};

export type ICPResearchReportData = BaseReportData<ICPResearchData>;

export const ICP_SECTIONS: ReportSection[] = [
  { id: "quick-reference", number: "00", title: "Quick Reference" },
  { id: "icp-overview", number: "01", title: "ICP Overview" },
  { id: "target-segmentation", number: "02", title: "Target Segmentation" },
  { id: "targeting-criteria", number: "03", title: "Targeting Criteria" },
  { id: "triggers", number: "04", title: "Buying Triggers" },
  {
    id: "buying-motivations-journey",
    number: "05",
    title: "Buying Motivations & Journey",
  },
  {
    id: "competitive-context",
    number: "06",
    title: "Competitive Positioning",
  },
  { id: "tactical-playbooks", number: "07", title: "Tactical Playbooks" },
  { id: "data-quality", number: "08", title: "Data Quality & Sources" },
];

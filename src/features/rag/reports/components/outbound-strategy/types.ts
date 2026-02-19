import type { BaseReportData, ReportSection } from "../../types/meta";

/** Data shape for outbound-strategy / lead-gen-targeting / offer-architect reports */
export type OutboundStrategyData = {
  target_profile?: Record<string, unknown>;
  targeting_strategy?: Record<string, unknown>;
  enrichment_requirements?: Record<string, unknown>;
  segmentation_rules?: Record<string, unknown>;
  title_packs?: unknown;
  technographic_signals?: Record<string, unknown>;
  behavioral_signals?: string[];
  positioning?: Record<string, unknown>;
  messaging?: Record<string, unknown>;
  discovery?: Record<string, unknown>;
  demo?: Record<string, unknown>;
  pilot?: Record<string, unknown>;
  proof_package?: Record<string, unknown>;
  research_links?: {
    confidence?: number;
    description?: string;
    google_search_links?: string[];
    linkedin_job_search_links?: string[];
    funding_search_links?: string[];
  };
};

export type OutboundStrategyReportData = BaseReportData<OutboundStrategyData>;

export const OUTBOUND_SECTIONS: ReportSection[] = [
  { id: "target-profile", number: "01", title: "Target Profile" },
  { id: "targeting-strategy", number: "02", title: "Targeting Strategy" },
  {
    id: "enrichment-requirements",
    number: "03",
    title: "Enrichment Requirements",
  },
  { id: "segmentation-rules", number: "04", title: "Segmentation Rules" },
  { id: "title-packs", number: "05", title: "Title Packs" },
  {
    id: "technographic-signals",
    number: "06",
    title: "Technographic Signals",
  },
  { id: "behavioral-signals", number: "07", title: "Behavioral Signals" },
  { id: "our-positioning", number: "08", title: "Our Positioning" },
  { id: "buyer-psychology", number: "09", title: "Buyer Psychology" },
  { id: "objection-handling", number: "10", title: "Objection Handling" },
  { id: "messaging-strategy", number: "11", title: "Messaging Strategy" },
  { id: "discovery", number: "12", title: "Discovery" },
  { id: "demo", number: "13", title: "Demo" },
  { id: "pilot", number: "14", title: "Pilot" },
  { id: "proof-package", number: "15", title: "Proof Package" },
];

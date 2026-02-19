import type { BaseReportData, ReportSection } from "../../types/meta";

/** Data shape for niche-intelligence / descriptive-intelligence reports */
export type NicheIntelligenceData = {
  basic_profile?: Record<string, unknown>;
  tam_analysis?: Record<string, unknown>;
  what_they_sell?: Record<string, unknown>;
  deal_economics?: Record<string, unknown>;
  client_acquisition_dynamics?: Record<string, unknown>;
  shadow_competitors?: Record<string, unknown>;
  financial_reality?: Record<string, unknown>;
  market_maturity?: Record<string, unknown>;
  pain_points?: Record<string, unknown>;
  desired_outcomes?: Record<string, unknown>;
  kpis_that_matter?: Record<string, unknown>;
  how_they_position?: Record<string, unknown>;
  their_customer_language?: Record<string, unknown>;
  buyer_psychology?: Record<string, unknown>;
  research_links?: {
    confidence?: number;
    description?: string;
    google_search_links?: string[];
    linkedin_job_search_links?: string[];
    funding_search_links?: string[];
  };
};

export type NicheIntelligenceReportData =
  BaseReportData<NicheIntelligenceData>;

export const NICHE_INTELLIGENCE_SECTIONS: ReportSection[] = [
  { id: "basic-profile", number: "01", title: "Basic Profile" },
  { id: "tam-analysis", number: "02", title: "TAM Analysis" },
  { id: "what-they-sell", number: "03", title: "What They Sell" },
  { id: "deal-economics", number: "04", title: "Deal Economics" },
  { id: "technology-stack", number: "05", title: "Technology Stack" },
  {
    id: "client-acquisition-dynamics",
    number: "06",
    title: "Client Acquisition Dynamics",
  },
  { id: "shadow-competitors", number: "07", title: "Shadow Competitors" },
  { id: "financial-reality", number: "08", title: "Financial Reality" },
  { id: "market-maturity", number: "09", title: "Market Maturity" },
  { id: "timing-intelligence", number: "10", title: "Timing Intelligence" },
  { id: "pain-points", number: "11", title: "Pain Points" },
  { id: "desired-outcomes", number: "12", title: "Desired Outcomes" },
  { id: "kpis-that-matter", number: "13", title: "KPIs That Matter" },
  { id: "how-they-position", number: "14", title: "How They Position" },
  {
    id: "their-customer-language",
    number: "15",
    title: "Their Customer Language",
  },
  { id: "buyer-psychology", number: "16", title: "Buyer Psychology" },
];

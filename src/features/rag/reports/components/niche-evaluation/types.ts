import type { BaseReportData, ReportSection } from "../../types/meta";

/** Data shape for niche-fit-evaluation reports (multi-agent format) */
export type NicheEvaluationData = {
  decision_card?: Record<string, unknown>;
  meta_synthesis?: Record<string, unknown>;
  quantitative_summary?: Record<string, unknown>;
  evidence_summary?: Record<string, unknown>;
  agent_consensus?: Record<string, unknown>;
  individual_evaluations?: Record<string, Record<string, unknown>>;
};

export type NicheEvaluationReportData = BaseReportData<NicheEvaluationData>;

export const NICHE_EVALUATION_SECTIONS: ReportSection[] = [
  { id: "executive-summary", number: "01", title: "Executive Summary" },
  { id: "agent-consensus", number: "02", title: "Agent Consensus" },
  {
    id: "meta-synthesis",
    number: "03",
    title: "Meta Synthesis Deep Dive",
  },
  {
    id: "quantitative-summary",
    number: "04",
    title: "Quantitative Summary",
  },
  {
    id: "individual-evaluations",
    number: "05",
    title: "Individual Agent Evaluations",
  },
  { id: "research-sources", number: "06", title: "Research Sources" },
];

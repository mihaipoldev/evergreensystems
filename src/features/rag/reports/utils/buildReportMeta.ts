import type { ReportMeta } from "../types/meta";

/**
 * Builds a standardized ReportMeta from raw meta payload.
 *
 * Every per-automation transform was copy-pasting this exact block.
 * Now they call `buildReportMeta(rawMeta)` instead.
 *
 * @param raw - The raw meta object from output_json
 * @param overrides - Optional overrides (e.g. normalized confidence)
 */
export function buildReportMeta(
  raw: Record<string, any>,
  overrides?: Partial<ReportMeta>
): ReportMeta {
  return {
    automation_name: raw.automation_name ?? "",
    report_type: raw.report_type ?? "",
    description: raw.description ?? "",
    perspective: raw.perspective ?? "",
    confidence: typeof raw.confidence === "number" ? raw.confidence : 0,
    confidence_rationale: raw.confidence_rationale ?? "",
    generated_at: raw.generated_at || new Date().toISOString().split("T")[0],
    sources_used: Array.isArray(raw.sources_used) ? raw.sources_used : [],
    sources_count: typeof raw.sources_count === "number" ? raw.sources_count : 0,
    input: {
      niche_name: raw.input?.niche_name ?? "",
      geography: raw.input?.geography ?? "",
      notes: raw.input?.notes ?? "",
      run_id: raw.input?.run_id ?? "",
    },
    ai_models: raw.ai_models ?? { research: "", synthesis: "" },
    analysis_summary: raw.analysis_summary ?? {
      total_agents: 0,
      agents_included: [],
      per_agent_confidence: {},
      domain_insights: {},
    },
    usage_metrics: raw.usage_metrics ?? {},
    ...overrides,
  };
}

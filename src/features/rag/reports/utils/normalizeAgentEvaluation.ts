/**
 * Normalizes agent evaluation data from either:
 * - Flat format: overall_fit_score, recommendation, dimension_scores_breakdown at root
 * - Nested format: final_verdict.*, critical_assessment.*, segment_analysis.*, evaluation_breakdown
 *
 * Returns a flat structure expected by IndividualAgentEvaluationsSection and IndividualScoresSection.
 */
export function normalizeAgentEvaluation(
  agentData: Record<string, unknown> | null | undefined
): Record<string, unknown> | null {
  if (!agentData || typeof agentData !== "object") return null;

  const fv = agentData.final_verdict as Record<string, unknown> | undefined;
  const ca = agentData.critical_assessment as Record<string, unknown> | undefined;
  const sa = agentData.segment_analysis as Record<string, unknown> | undefined;
  const eb = agentData.evaluation_breakdown as Record<
    string,
    { score?: number; evidence?: string; concerns?: unknown }
  > | undefined;

  // Dimension scores: prefer final_verdict.dimension_scores_breakdown, else build from evaluation_breakdown
  type DimensionScoreValue = number | { score?: number; evidence?: string; concerns?: unknown };
  let dimensionScores: Record<string, DimensionScoreValue> | undefined =
    (agentData.dimension_scores_breakdown as Record<string, DimensionScoreValue> | undefined) ??
    (fv?.dimension_scores_breakdown as Record<string, DimensionScoreValue> | undefined);

  if (!dimensionScores && eb && Object.keys(eb).length > 0) {
    dimensionScores = {};
    for (const [dim, val] of Object.entries(eb)) {
      if (val && typeof val === "object" && "score" in val) {
        dimensionScores[dim] = val;
      }
    }
  }

  const addressableSegment = (sa?.addressable_segment as Record<string, unknown>) ?? undefined;

  return {
    ...agentData,
    overall_fit_score:
      agentData.overall_fit_score ?? fv?.overall_fit_score ?? 0,
    recommendation:
      agentData.recommendation ?? fv?.recommendation ?? "",
    confidence_score:
      agentData.confidence_score ?? fv?.confidence_score ?? 0,
    one_line_summary:
      agentData.one_line_summary ?? fv?.one_line_summary ?? "",
    dimension_scores_breakdown: dimensionScores,
    deal_breakers:
      (agentData.deal_breakers as string[] | undefined) ??
      (ca?.deal_breakers as string[] | undefined) ??
      [],
    strong_advantages:
      (agentData.strong_advantages as string[] | undefined) ??
      (ca?.strong_advantages as string[] | undefined) ??
      [],
    open_questions:
      (agentData.open_questions as string[] | undefined) ??
      (ca?.open_questions as string[] | undefined) ??
      [],
    addressable_segment: agentData.addressable_segment ?? addressableSegment,
    segment_analysis: agentData.segment_analysis ?? sa,
  };
}

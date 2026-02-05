/**
 * Extract score and verdict from output_json.
 * Supports both NEW format (decision_card, quantitative_summary) and OLD format (data.verdict).
 * New format is tried first; falls back to old format if not available.
 *
 * @param outputJson - Raw output_json from rag_run_outputs
 * @returns { score, verdict } or null if neither format has data
 */
export function extractEvaluationResultFromOutput(outputJson: unknown): {
  score: number | null;
  verdict: "pursue" | "test" | "caution" | "avoid" | null;
} | null {
  if (!outputJson || typeof outputJson !== "object") return null;

  const obj = outputJson as Record<string, unknown>;
  const firstElement =
    Array.isArray(obj) && obj.length > 0 ? (obj[0] as Record<string, unknown>) : obj;
  const data = (firstElement?.data ?? obj?.data) as Record<string, unknown> | undefined;

  if (!data || typeof data !== "object") return null;

  let score: number | null = null;
  let verdict: "pursue" | "test" | "caution" | "avoid" | null = null;

  // --- NEW FORMAT: decision_card, quantitative_summary ---
  const decisionCard = data.decision_card as Record<string, unknown> | undefined;
  const quantSummary = data.quantitative_summary as Record<string, unknown> | undefined;
  const scoreAnalysis = quantSummary?.score_analysis as Record<string, unknown> | undefined;

  if (decisionCard || scoreAnalysis) {
    // Score: decision_card.score, or quantitative_summary.score_analysis.median
    if (typeof decisionCard?.score === "number") {
      score = decisionCard.score;
    } else if (typeof decisionCard?.score === "string") {
      const parsed = parseFloat(decisionCard.score);
      if (!isNaN(parsed)) score = parsed;
    }
    if (score == null && scoreAnalysis?.median != null) {
      const median = scoreAnalysis.median;
      score = typeof median === "number" ? median : parseFloat(String(median));
      if (isNaN(score as number)) score = null;
    }

    // Verdict: decision_card.recommendation or decision_card.verdict
    const rec =
      (decisionCard?.recommendation ?? decisionCard?.verdict) as string | undefined;
    if (rec && typeof rec === "string") {
      const r = rec.toLowerCase();
      if (r === "pursue" || r === "test" || r === "caution" || r === "avoid") {
        verdict = r;
      }
    }
  }

  // --- OLD FORMAT: data.verdict (label, score) ---
  if (score == null || verdict == null) {
    const verdictObj = data.verdict as Record<string, unknown> | undefined;
    if (verdictObj && typeof verdictObj === "object") {
      if (score == null) {
        const s = verdictObj.score;
        if (typeof s === "number") score = s;
        else if (typeof s === "string") {
          const parsed = parseFloat(s);
          if (!isNaN(parsed)) score = parsed;
        }
      }
      if (verdict == null) {
        const label = (verdictObj.label ?? verdictObj.recommendation) as string | undefined;
        if (label && typeof label === "string") {
          const r = label.toLowerCase();
          if (r === "pursue" || r === "test" || r === "caution" || r === "avoid") {
            verdict = r;
          }
        }
      }
    }
  }

  if (score === null && verdict === null) return null;
  return { score, verdict };
}

import type { Run } from "../types";
import { extractEvaluationResultFromOutput } from "./extractEvaluationResultFromOutput";

type WorkflowResult = {
  verdict: "pursue" | "test" | "caution" | "avoid" | null;
  score: number | null;
};

type RunWithOutput = Run & { output_json?: unknown };

/**
 * Extract workflow-specific result data.
 * Tries NEW format (output_json: decision_card, quantitative_summary) first,
 * then falls back to OLD format (metadata.evaluation_result).
 *
 * @param run - The run object with metadata; may include output_json from rag_run_outputs
 * @returns Workflow result with verdict and score, or null if not available
 */
export function extractWorkflowResult(run: RunWithOutput): WorkflowResult | null {
  // Only handle niche_fit_evaluation workflow for now
  if (run.workflow_name !== "niche_fit_evaluation") {
    return null;
  }

  // 1. Try NEW format from output_json first (decision_card, quantitative_summary)
  const outputJson = run.output_json;
  if (outputJson) {
    const fromOutput = extractEvaluationResultFromOutput(outputJson);
    if (fromOutput && (fromOutput.score !== null || fromOutput.verdict !== null)) {
      return fromOutput;
    }
  }

  // 2. Fall back to OLD format: metadata.evaluation_result (backfilled for legacy runs)
  const evaluationResult = run.metadata?.evaluation_result;

  if (!evaluationResult || typeof evaluationResult !== "object") {
    return null;
  }

  // Extract and normalize verdict
  let verdict: "pursue" | "test" | "caution" | "avoid" | null = null;
  if (evaluationResult.verdict && typeof evaluationResult.verdict === "string") {
    const normalizedVerdict = evaluationResult.verdict.toLowerCase();
    if (normalizedVerdict === "pursue" || normalizedVerdict === "test" || normalizedVerdict === "caution" || normalizedVerdict === "avoid") {
      verdict = normalizedVerdict;
    }
  }

  // Extract score
  let score: number | null = null;
  if (typeof evaluationResult.score === "number") {
    score = evaluationResult.score;
  } else if (typeof evaluationResult.score === "string") {
    const parsedScore = parseFloat(evaluationResult.score);
    if (!isNaN(parsedScore)) {
      score = parsedScore;
    }
  }

  // Return null if we don't have at least one valid value
  if (verdict === null && score === null) {
    return null;
  }

  return { verdict, score };
}


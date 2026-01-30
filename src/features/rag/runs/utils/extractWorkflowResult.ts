import type { Run } from "../types";

type WorkflowResult = {
  verdict: "pursue" | "test" | "caution" | "avoid" | null;
  score: number | null;
};

/**
 * Extract workflow-specific result data from run metadata.
 * Currently supports niche_fit_evaluation workflow.
 *
 * Fit score and verdict come from metadata.evaluation_result (set when the run
 * completes; for legacy niche_fit_evaluation runs, backfilled from
 * rag_run_outputs.output_json by migration 20260129100000).
 *
 * @param run - The run object with metadata
 * @returns Workflow result with verdict and score, or null if not available
 */
export function extractWorkflowResult(run: Run): WorkflowResult | null {
  // Only handle niche_fit_evaluation workflow for now
  if (run.workflow_name !== "niche_fit_evaluation") {
    return null;
  }

  // Access evaluation_result from metadata (backfilled for legacy runs)
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


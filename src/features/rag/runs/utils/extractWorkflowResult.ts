import type { Run } from "../types";

type WorkflowResult = {
  verdict: "pursue" | "test" | "caution" | "avoid" | null;
  score: number | null;
};

/**
 * Extract workflow-specific result data from run metadata
 * Currently supports niche_fit_evaluation workflow
 * 
 * @param run - The run object with metadata
 * @returns Workflow result with verdict and score, or null if not available
 */
export function extractWorkflowResult(run: Run): WorkflowResult | null {
  // Debug logging
  console.log("[extractWorkflowResult] Run ID:", run.id);
  console.log("[extractWorkflowResult] Workflow name:", run.workflow_name);
  console.log("[extractWorkflowResult] Workflow ID:", run.workflow_id);
  console.log("[extractWorkflowResult] Metadata:", run.metadata);
  
  // Only handle niche_fit_evaluation workflow for now
  if (run.workflow_name !== "niche_fit_evaluation") {
    console.log("[extractWorkflowResult] Workflow name mismatch - expected 'niche_fit_evaluation', got:", run.workflow_name);
    return null;
  }

  // Access evaluation_result from metadata
  const evaluationResult = run.metadata?.evaluation_result;
  console.log("[extractWorkflowResult] Evaluation result:", evaluationResult);
  
  if (!evaluationResult || typeof evaluationResult !== "object") {
    console.log("[extractWorkflowResult] No evaluation_result found or invalid type");
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
    console.log("[extractWorkflowResult] No valid verdict or score found");
    return null;
  }

  const result = { verdict, score };
  console.log("[extractWorkflowResult] Returning result:", result);
  return result;
}


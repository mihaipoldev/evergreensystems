export type RunStatus = "queued" | "collecting" | "ingesting" | "generating" | "complete" | "failed";

export type Run = {
  id: string;
  knowledge_base_id: string;
  workflow_id: string | null; // Primary identifier - should not be null for new runs
  project_id?: string | null;
  subject_id?: string | null;
  input: Record<string, any>; // JSONB - stores { niche_name, geo, notes } and other inputs
  status: RunStatus;
  error: string | null;
  metadata: Record<string, any>; // JSONB - stores used_knowledge_base_ids array and other metadata
  created_by: string | null;
  created_at: string;
  updated_at: string;
  // Extended fields from joins (not in DB)
  workflow_name?: string | null;
  workflow_label?: string | null;
  knowledge_base_name?: string | null;
  project_name?: string | null;
  report_id?: string | null;
};

/**
 * Get display label for a run
 * Uses workflow_label, falls back to workflow_name or "Unknown Run"
 */
export function getRunLabel(run: Run): string {
  if (run.workflow_label) {
    return run.workflow_label;
  }
  
  if (run.workflow_name) {
    // Format workflow_name: "niche_intelligence" -> "Niche Intelligence"
    return run.workflow_name
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }
  
  return "Unknown Run";
}

/**
 * Get workflow name for a run
 */
export function getRunWorkflowName(run: Run): string | null {
  return run.workflow_name || null;
}


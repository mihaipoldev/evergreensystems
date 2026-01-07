import { createServiceRoleClient } from "@/lib/supabase/server";
import type { Run, RunStatus } from "./types";

/**
 * Get all runs, optionally filtered by knowledge base or project/subject
 * Uses service role client to bypass RLS for admin operations
 */
export async function getAllRuns(knowledgeBaseId?: string, subjectId?: string, projectId?: string): Promise<Run[]> {
  const supabase = createServiceRoleClient();
  let query = supabase
    .from("rag_runs")
    .select("*")
    .order("created_at", { ascending: false });

  if (knowledgeBaseId) {
    query = query.eq("knowledge_base_id", knowledgeBaseId);
  }

  // Use project_id (new) or subject_id (backward compat)
  const effectiveProjectId = projectId || subjectId;
  if (effectiveProjectId) {
    query = query.eq("project_id", effectiveProjectId);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return (data || []) as Run[];
}

/**
 * Get a single run by id
 * Uses service role client to bypass RLS for admin operations
 */
export async function getRunById(id: string): Promise<Run | null> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("rag_runs")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    throw error;
  }

  return data as Run;
}

/**
 * Create a new run
 * Uses service role client to bypass RLS for admin operations
 */
export async function createRun(payload: {
  knowledge_base_id: string;
  input: Record<string, any>;
  metadata?: Record<string, any>;
  created_by?: string | null;
  workflow_id: string; // Required - primary identifier
  project_id?: string | null;
  subject_id?: string | null; // Backward compatibility
}): Promise<Run> {
  const supabase = createServiceRoleClient();
  // Use project_id (new) or subject_id (backward compat)
  const effectiveProjectId = payload.project_id || payload.subject_id;
  
  const { data, error } = await supabase
    .from("rag_runs")
    // @ts-expect-error - rag_runs table type not fully recognized by TypeScript
    .insert({
      knowledge_base_id: payload.knowledge_base_id,
      input: payload.input,
      metadata: payload.metadata || {},
      created_by: payload.created_by || null,
      workflow_id: payload.workflow_id, // Required
      project_id: effectiveProjectId || null,
      status: "queued",
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as Run;
}

/**
 * Update run status
 * Uses service role client to bypass RLS for admin operations
 */
export async function updateRunStatus(id: string, status: RunStatus, error?: string | null): Promise<Run> {
  const supabase = createServiceRoleClient();
  const updateData: { status: RunStatus; error?: string | null } = { status };
  if (error !== undefined) {
    updateData.error = error;
  }

  const { data, error: updateError } = await supabase
    .from("rag_runs")
    // @ts-expect-error - rag_runs table type not fully recognized by TypeScript
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (updateError) {
    throw updateError;
  }

  return data as Run;
}


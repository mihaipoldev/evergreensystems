import { createServiceRoleClient } from "@/lib/supabase/server";
import type { RunOutput, RunDocument, UiSchema } from "./types";

/**
 * Get run output by run id
 * Uses service role client to bypass RLS for admin operations
 */
export async function getRunOutputByRunId(runId: string): Promise<RunOutput | null> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("rag_run_outputs")
    .select("*")
    .eq("run_id", runId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    throw error;
  }

  return data as RunOutput;
}

/**
 * Get all run documents for a run
 * Uses service role client to bypass RLS for admin operations
 */
export async function getRunDocumentsByRunId(runId: string): Promise<RunDocument[]> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("rag_run_documents")
    .select("*")
    .eq("run_id", runId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data || []) as RunDocument[];
}

/**
 * Create a new run output
 * Uses service role client to bypass RLS for admin operations
 */
export async function createRunOutput(payload: {
  run_id: string;
  output_json: Record<string, any>;
  pdf_storage_path?: string | null;
  ui_schema?: UiSchema | null;
}): Promise<RunOutput> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("rag_run_outputs")
    // @ts-expect-error - Supabase infers never for rag_run_outputs; schema types may be out of sync
    .insert({
      run_id: payload.run_id,
      output_json: payload.output_json,
      pdf_storage_path: payload.pdf_storage_path ?? null,
      ui_schema: payload.ui_schema ?? null,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as RunOutput;
}

/**
 * Update a run output (e.g. ui_schema, output_json, pdf_storage_path)
 * Uses service role client to bypass RLS for admin operations
 */
export async function updateRunOutput(
  id: string,
  payload: {
    output_json?: Record<string, any>;
    pdf_storage_path?: string | null;
    ui_schema?: UiSchema | null;
  }
): Promise<RunOutput> {
  const supabase = createServiceRoleClient();
  const updatePayload: Record<string, unknown> = {};
  if (payload.output_json !== undefined) updatePayload.output_json = payload.output_json;
  if (payload.pdf_storage_path !== undefined) updatePayload.pdf_storage_path = payload.pdf_storage_path;
  if (payload.ui_schema !== undefined) updatePayload.ui_schema = payload.ui_schema;

  const { data, error } = await supabase
    .from("rag_run_outputs")
    // @ts-expect-error - Supabase infers never for rag_run_outputs; schema types may be out of sync
    .update(updatePayload)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as RunOutput;
}


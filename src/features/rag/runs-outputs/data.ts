import { createServiceRoleClient } from "@/lib/supabase/server";
import type { RunOutput, RunDocument } from "./types";

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
}): Promise<RunOutput> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("rag_run_outputs")
    // @ts-ignore - rag_run_outputs table type not fully recognized by TypeScript
    .insert({
      run_id: payload.run_id,
      output_json: payload.output_json,
      pdf_storage_path: payload.pdf_storage_path || null,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as RunOutput;
}


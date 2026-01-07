import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { transformOutputJson } from "../utils/transformOutputJson";
import type { ReportData } from "../types";

/**
 * Server-side function to fetch and transform report data
 * Tries regular client first (respects RLS), falls back to service role if needed
 */
export async function getReportData(id: string): Promise<{
  data: ReportData | null;
  error: string | null;
}> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { data: null, error: "Unauthorized" };
    }

    // Try with regular client first (respects RLS)
    let { data, error } = await supabase
      .from("rag_run_outputs")
      .select(`
        *,
        rag_runs (
          id,
          workflow_id,
          status,
          knowledge_base_id,
          created_at,
          rag_knowledge_bases (
            id,
            name
          ),
          workflows (
            id,
            name,
            label
          )
        )
      `)
      .eq("id", id)
      .maybeSingle();

    // If not found by id, try by run_id
    if (!data && !error) {
      const result = await supabase
        .from("rag_run_outputs")
        .select(`
          *,
          rag_runs (
            id,
            workflow_id,
            status,
            knowledge_base_id,
            created_at,
            rag_knowledge_bases (
              id,
              name
            ),
            workflows (
              id,
              name,
              label
            )
          )
        `)
        .eq("run_id", id)
        .maybeSingle();
      
      data = result.data;
      error = result.error;
    }

    // If still not found (likely RLS blocking), try with service role client
    if (!data && !error) {
      const adminSupabase = createServiceRoleClient();
      
      let adminResult = await adminSupabase
        .from("rag_run_outputs")
        .select(`
          *,
          rag_runs (
            id,
            workflow_id,
            status,
            knowledge_base_id,
            created_at,
            rag_knowledge_bases (
              id,
              name
            ),
            workflows (
              id,
              name,
              label
            )
          )
        `)
        .eq("id", id)
        .maybeSingle();

      if (!adminResult.data && !adminResult.error) {
        adminResult = await adminSupabase
          .from("rag_run_outputs")
          .select(`
            *,
            rag_runs (
              id,
              workflow_id,
              status,
              knowledge_base_id,
              created_at,
              rag_knowledge_bases (
                id,
                name
              ),
              workflows (
                id,
                name,
                label
              )
            )
          `)
          .eq("run_id", id)
          .maybeSingle();
      }

      data = adminResult.data;
      error = adminResult.error;
    }

    if (error) {
      if (error.code === "PGRST116") {
        return { data: null, error: "Report not found" };
      }
      return { data: null, error: error.message };
    }

    const dataTyped = data as { output_json: any } | null;
    if (!dataTyped || !dataTyped.output_json) {
      return { data: null, error: "Report data is missing" };
    }

    const transformed = transformOutputJson(dataTyped.output_json);
    return { data: transformed, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}


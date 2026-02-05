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
  workflowName: string | null;
  workflowLabel: string | null;
  projectName: string | null;
  runStatus: string | null;
  runInput: Record<string, unknown> | null;
}> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { data: null, error: "Unauthorized", workflowName: null, workflowLabel: null, projectName: null, runStatus: null, runInput: null };
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
          project_id,
          created_at,
          input,
          rag_knowledge_bases (
            id,
            name
          ),
          workflows (
            id,
            slug,
            name
          ),
          projects (
            id,
            name
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
            project_id,
          created_at,
          input,
          rag_knowledge_bases (
              id,
              name
            ),
            workflows (
              id,
              slug,
              name
            ),
            projects (
              id,
              name
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
            project_id,
          created_at,
          input,
          rag_knowledge_bases (
              id,
              name
            ),
            workflows (
              id,
              slug,
              name
            ),
            projects (
              id,
              name
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
            project_id,
          created_at,
          input,
          rag_knowledge_bases (
              id,
              name
            ),
            workflows (
              id,
              slug,
              name
            ),
            projects (
              id,
              name
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
        return { data: null, error: "Report not found", workflowName: null, workflowLabel: null, projectName: null, runStatus: null, runInput: null };
      }
      return { data: null, error: error.message, workflowName: null, workflowLabel: null, projectName: null, runStatus: null, runInput: null };
    }

    const dataTyped = data as {
      output_json: any;
      rag_runs?:
        | {
            status?: string;
            input?: Record<string, unknown>;
            workflows?: { slug: string; name: string } | null;
            projects?: { id: string; name: string } | { id: string; name: string }[] | null;
          }
        | Array<{
            status?: string;
            input?: Record<string, unknown>;
            workflows?: { slug: string; name: string } | null;
            projects?: { id: string; name: string } | { id: string; name: string }[] | null;
          }>
        | null;
    } | null;

    if (!dataTyped || !dataTyped.output_json) {
      return { data: null, error: "Report data is missing", workflowName: null, workflowLabel: null, projectName: null, runStatus: null, runInput: null };
    }

    // Resolve rag_runs (can be single object or array depending on PostgREST)
    const ragRun = Array.isArray(dataTyped.rag_runs)
      ? dataTyped.rag_runs[0]
      : dataTyped.rag_runs ?? null;

    // Extract workflow slug and normalize (lowercase, hyphens and spaces -> underscores) for consistent lookup
    const rawSlug = ragRun?.workflows?.slug ?? null;
    const workflowName = rawSlug
      ? String(rawSlug).toLowerCase().replace(/-/g, "_").replace(/\s+/g, "_").trim() || null
      : null;
    const workflowLabel = ragRun?.workflows?.name ?? null;
    const runStatus = ragRun?.status ?? null;

    const projects = ragRun?.projects;
    const projectName = Array.isArray(projects) ? projects[0]?.name ?? null : projects?.name ?? null;

    const transformed = transformOutputJson(dataTyped.output_json);
    const runInput = (ragRun as { input?: Record<string, unknown> })?.input ?? null;
    return { data: transformed, error: null, workflowName, workflowLabel, projectName, runStatus, runInput };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
      workflowName: null,
      workflowLabel: null,
      projectName: null,
      runStatus: null,
      runInput: null,
    };
  }
}


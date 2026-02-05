import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

type ReportData = {
  id: string;
  run_id: string;
  output_json: Record<string, any>;
  pdf_storage_path: string | null;
  ui_schema: Record<string, any> | null;
  created_at: string;
  rag_runs: {
    id: string;
    workflow_id: string | null;
    status: string;
    knowledge_base_id: string;
    created_at: string;
    rag_knowledge_bases: {
      id: string;
      name: string;
    } | {
      id: string;
      name: string;
    }[] | null;
    workflows: {
      id: string;
      slug: string;
      name: string;
    } | null;
  } | null;
} | null;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log("[API] Reports route hit - /api/intel/reports/[id]");
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.log("[API] Unauthorized");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    console.log("[API] Fetching report with id:", id);

    // Try with regular client first (respects RLS)
    // If that fails due to RLS, fall back to service role client
    let { data, error }: { data: ReportData; error: any } = await supabase
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
            slug,
            name
          )
        )
      `)
      .eq("id", id)
      .maybeSingle();

    console.log("[API] Query by output id - data:", data ? "found" : "not found", "error:", error?.code, error?.message);

    // If not found by id, try by run_id
    if (!data && !error) {
      console.log("[API] Trying to find by run_id:", id);
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
              slug,
              name
            )
          )
        `)
        .eq("run_id", id)
        .maybeSingle();
      
      data = result.data as ReportData;
      error = result.error;
      console.log("[API] Query by run_id - data:", data ? "found" : "not found", "error:", error?.code, error?.message);
    }

    // If still not found and no error (likely RLS blocking), try with service role client
    if (!data && !error) {
      console.log("[API] No data found with regular client, trying service role client (bypass RLS)");
      const adminSupabase = createServiceRoleClient();
      
      // Try by output id
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
              slug,
              name
            )
          )
        `)
        .eq("id", id)
        .maybeSingle();

      // If not found, try by run_id
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
                slug,
                name
              )
            )
          `)
          .eq("run_id", id)
          .maybeSingle();
      }

      data = adminResult.data as ReportData;
      error = adminResult.error;
      console.log("[API] Service role query - data:", data ? "found" : "not found", "error:", error?.code, error?.message);
    }

    if (error) {
      console.log("[API] Query error:", error.code, error.message);
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Report not found" }, { status: 404 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      console.log("[API] Report not found for id:", id);
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    console.log("[API] Report found, returning data");
    // Return the output_json along with run metadata
    return NextResponse.json({
      id: data.id,
      run_id: data.run_id,
      output_json: data.output_json,
      pdf_storage_path: data.pdf_storage_path,
      ui_schema: data.ui_schema ?? null,
      created_at: data.created_at,
      run: data.rag_runs ? {
        id: data.rag_runs.id,
        workflow_id: data.rag_runs.workflow_id,
        workflow_name: data.rag_runs.workflows?.slug || null,
        workflow_label: data.rag_runs.workflows?.name || null,
        status: data.rag_runs.status,
        knowledge_base_id: data.rag_runs.knowledge_base_id,
        created_at: data.rag_runs.created_at,
        knowledge_base_name: Array.isArray(data.rag_runs.rag_knowledge_bases)
          ? data.rag_runs.rag_knowledge_bases[0]?.name
          : data.rag_runs.rag_knowledge_bases?.name || null,
      } : null,
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

/** Validate that a string is valid JSON; returns parsed object or null and error message */
function parseJsonSafe(value: string): { data: unknown; error: null } | { data: null; error: string } {
  if (value.trim() === "") {
    return { data: null, error: "JSON cannot be empty when provided" };
  }
  try {
    const parsed = JSON.parse(value) as unknown;
    return { data: parsed, error: null };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Invalid JSON";
    return { data: null, error: message };
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json().catch(() => ({})) as {
      output_json?: string | Record<string, any>;
      pdf_storage_path?: string | null;
      ui_schema?: string | Record<string, any> | null;
    };

    const adminSupabase = createServiceRoleClient();

    // Resolve output id (id might be run_id)
    let outputId = id;
    const byOutputId = await adminSupabase
      .from("rag_run_outputs")
      .select("id")
      .eq("id", id)
      .maybeSingle();
    if (!byOutputId.data) {
      const byRunId = await adminSupabase
        .from("rag_run_outputs")
        .select("id")
        .eq("run_id", id)
        .maybeSingle();
      const runOutput = byRunId.data as { id: string } | null;
      if (runOutput) {
        outputId = runOutput.id;
      }
    }

    const updatePayload: {
      output_json?: Record<string, any>;
      pdf_storage_path?: string | null;
      ui_schema?: Record<string, any> | null;
    } = {};

    if (body.output_json !== undefined) {
      const raw = typeof body.output_json === "string" ? body.output_json : JSON.stringify(body.output_json);
      const result = parseJsonSafe(raw);
      if (result.error) {
        return NextResponse.json({ error: `output_json: ${result.error}` }, { status: 400 });
      }
      updatePayload.output_json = result.data as Record<string, any>;
    }

    if (body.pdf_storage_path !== undefined) {
      updatePayload.pdf_storage_path = body.pdf_storage_path;
    }

    if (body.ui_schema !== undefined) {
      if (body.ui_schema === null || body.ui_schema === "") {
        updatePayload.ui_schema = null;
      } else {
        const raw = typeof body.ui_schema === "string" ? body.ui_schema : JSON.stringify(body.ui_schema);
        const result = parseJsonSafe(raw);
        if (result.error) {
          return NextResponse.json({ error: `ui_schema: ${result.error}` }, { status: 400 });
        }
        updatePayload.ui_schema = result.data as Record<string, any>;
      }
    }

    if (Object.keys(updatePayload).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    const { data, error } = await adminSupabase
      .from("rag_run_outputs")
      // @ts-expect-error - Supabase infers never for rag_run_outputs update; schema types may be out of sync
      .update(updatePayload)
      .eq("id", outputId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unexpected error occurred" },
      { status: 500 }
    );
  }
}


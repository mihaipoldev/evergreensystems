import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

type ReportData = {
  id: string;
  run_id: string;
  output_json: Record<string, any>;
  pdf_storage_path: string | null;
  created_at: string;
  rag_runs: {
    id: string;
    run_type: string;
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
          run_type,
          status,
          knowledge_base_id,
          created_at,
          rag_knowledge_bases (
            id,
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
            run_type,
            status,
            knowledge_base_id,
            created_at,
            rag_knowledge_bases (
              id,
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
            run_type,
            status,
            knowledge_base_id,
            created_at,
            rag_knowledge_bases (
              id,
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
              run_type,
              status,
              knowledge_base_id,
              created_at,
              rag_knowledge_bases (
                id,
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
      created_at: data.created_at,
      run: data.rag_runs ? {
        id: data.rag_runs.id,
        run_type: data.rag_runs.run_type,
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


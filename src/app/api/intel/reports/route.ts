import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminSupabase = createServiceRoleClient();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");

    let query = adminSupabase
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
      `);

    if (search && search.trim() !== "") {
      // Search in output_json or run info
      // For now, we'll just order by created_at
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Transform data to include run and knowledge base info
    const reportsWithRun = (data || []).map((report: any) => ({
      ...report,
      run: report.rag_runs ? {
        ...report.rag_runs,
        knowledge_base_name: report.rag_runs.rag_knowledge_bases?.name || null,
        workflow_name: report.rag_runs.workflows?.name || null,
        workflow_label: report.rag_runs.workflows?.label || null,
      } : null,
    }));

    return NextResponse.json(reportsWithRun, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unexpected error occurred" },
      { status: 500 }
    );
  }
}


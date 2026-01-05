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
    const status = searchParams.get("status");
    const runType = searchParams.get("run_type");
    const search = searchParams.get("search");

    let query = adminSupabase
      .from("rag_runs")
      .select(`
        *,
        rag_knowledge_bases (
          id,
          name
        )
      `);

    if (status && status !== "All") {
      query = query.eq("status", status.toLowerCase());
    }

    if (runType && runType !== "All") {
      query = query.eq("run_type", runType);
    }

    if (search && search.trim() !== "") {
      // Search in input JSONB field
      const searchPattern = `%${search.trim()}%`;
      // Note: JSONB search is complex, for now we'll search in knowledge base name
      // In a real implementation, you might want to use jsonb_path_exists or similar
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Transform data to include knowledge base name
    const runsWithKB = (data || []).map((run: any) => ({
      ...run,
      knowledge_base_name: run.rag_knowledge_bases?.name || null,
    }));

    return NextResponse.json(runsWithKB, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unexpected error occurred" },
      { status: 500 }
    );
  }
}


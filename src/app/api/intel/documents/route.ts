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
    const search = searchParams.get("search");

    let query = adminSupabase
      .from("rag_documents")
      .select(`
        *,
        rag_knowledge_bases (
          id,
          name
        )
      `)
      .is("deleted_at", null);

    if (status && status !== "All") {
      query = query.eq("status", status.toLowerCase());
    }

    if (search && search.trim() !== "") {
      const searchPattern = `%${search.trim()}%`;
      query = query.ilike("title", searchPattern);
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Transform data to include knowledge base name
    const documentsWithKB = (data || []).map((doc: any) => ({
      ...doc,
      knowledge_base_name: doc.rag_knowledge_bases?.name || null,
    }));

    return NextResponse.json(documentsWithKB, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unexpected error occurred" },
      { status: 500 }
    );
  }
}


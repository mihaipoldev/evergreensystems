import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

export async function GET(_request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminSupabase = createServiceRoleClient();

    const { data, error } = await adminSupabase
      .from("rag_knowledge_bases")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get document counts for each knowledge base (excluding soft-deleted)
    const knowledgeBasesWithCounts = await Promise.all(
      (data || []).map(async (kb: any) => {
        const { count, error: countError } = await adminSupabase
          .from("rag_documents")
          .select("*", { count: "exact", head: true })
          .eq("knowledge_base_id", kb.id)
          .is("deleted_at", null);

        return {
          ...kb,
          document_count: countError ? 0 : (count || 0),
        };
      })
    );

    return NextResponse.json(knowledgeBasesWithCounts, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminSupabase = createServiceRoleClient();

    const body = await request.json();
    const { name, description, kb_type, visibility, is_active } = body;

    if (!name) {
      return NextResponse.json(
        { error: "name is required" },
        { status: 400 }
      );
    }

    const { data, error } = await (adminSupabase
      .from("rag_knowledge_bases") as any)
      .insert({
        name,
        description: description || null,
        kb_type: kb_type || null,
        visibility: visibility || "private",
        is_active: is_active ?? true,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    revalidateTag("rag-knowledge-bases", "max");

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unexpected error occurred" },
      { status: 500 }
    );
  }
}


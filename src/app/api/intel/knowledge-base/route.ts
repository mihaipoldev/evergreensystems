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

    // Fetch all knowledge bases
    const { data: knowledgeBases, error: kbError } = await adminSupabase
      .from("rag_knowledge_bases")
      .select("*")
      .order("created_at", { ascending: false });

    if (kbError) {
      return NextResponse.json({ error: kbError.message }, { status: 500 });
    }

    if (!knowledgeBases || knowledgeBases.length === 0) {
      return NextResponse.json([], { status: 200 });
    }

    // Get all KB IDs
    const kbIds = knowledgeBases.map((kb: any) => kb.id);

    // Fetch document counts for all knowledge bases in a single query
    // Using in() filter to get counts for all KBs at once
    const { data: documentCounts, error: countError } = await adminSupabase
      .from("rag_documents")
      .select("knowledge_base_id")
      .in("knowledge_base_id", kbIds)
      .is("deleted_at", null);

    if (countError) {
      return NextResponse.json({ error: countError.message }, { status: 500 });
    }

    // Create a map of knowledge_base_id -> count
    const countMap = new Map<string, number>();
    (documentCounts || []).forEach((doc: any) => {
      const kbId = doc.knowledge_base_id;
      countMap.set(kbId, (countMap.get(kbId) || 0) + 1);
    });

    // Combine knowledge bases with their document counts
    const knowledgeBasesWithCounts = knowledgeBases.map((kb: any) => ({
      ...kb,
      document_count: countMap.get(kb.id) || 0,
    }));

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


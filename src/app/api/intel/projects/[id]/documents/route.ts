import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminSupabase = createServiceRoleClient();

    const { id } = await params;

    // Step 1: Get project to find workspace KB
    const { data: project, error: projectError } = await adminSupabase
      .from("projects")
      .select("kb_id")
      .eq("id", id)
      .single<{ kb_id: string }>();

    if (projectError || !project) {
      return NextResponse.json(
        { error: projectError?.message || "Project not found" },
        { status: projectError ? 500 : 404 }
      );
    }

    // Step 2: Get linked documents (from junction table - research documents from other KBs)
    const { data: linkedDocs, error: linkedError } = await adminSupabase
      .from("project_documents")
      .select(`
        document_id,
        rag_documents (*)
      `)
      .eq("project_id", id);

    if (linkedError) {
      return NextResponse.json({ error: linkedError.message }, { status: 500 });
    }

    // Step 3: Get workspace documents (documents in project's workspace KB)
    const { data: workspaceDocs, error: workspaceError } = await adminSupabase
      .from("rag_documents")
      .select("*")
      .eq("knowledge_base_id", project.kb_id)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (workspaceError) {
      return NextResponse.json({ error: workspaceError.message }, { status: 500 });
    }

    return NextResponse.json(
      {
        linked: linkedDocs || [],
        workspace: workspaceDocs || [],
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unexpected error occurred" },
      { status: 500 }
    );
  }
}


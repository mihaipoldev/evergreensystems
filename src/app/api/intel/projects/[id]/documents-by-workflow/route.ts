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

    const { id: projectId } = await params;
    const { searchParams } = new URL(request.url);
    const workflowType = searchParams.get("workflow_type");

    if (!workflowType?.trim()) {
      return NextResponse.json(
        { error: "workflow_type query parameter is required" },
        { status: 400 }
      );
    }

    const adminSupabase = createServiceRoleClient();

    // Step 1: Get project to find workspace KB
    const { data: project, error: projectError } = await adminSupabase
      .from("projects")
      .select("kb_id")
      .eq("id", projectId)
      .single<{ kb_id: string }>();

    if (projectError || !project) {
      return NextResponse.json(
        { error: projectError?.message || "Project not found" },
        { status: projectError ? 500 : 404 }
      );
    }

    // Step 2: Get workflow ID for the given slug (workflow_type)
    // Normalize: lowercase, hyphens and spaces -> underscores (e.g. "icp-research" -> "icp_research")
    const normalizedSlug = workflowType
      .trim()
      .toLowerCase()
      .replace(/-/g, "_")
      .replace(/\s+/g, "_");

    const { data: workflow, error: workflowError } = await adminSupabase
      .from("workflows")
      .select("id")
      .eq("slug", normalizedSlug)
      .maybeSingle<{ id: string }>();

    if (workflowError || !workflow) {
      return NextResponse.json(
        { documents: [] },
        { status: 200 }
      );
    }

    // Step 3: Get runs for this project + workflow
    const { data: runs, error: runsError } = await (adminSupabase
      .from("rag_runs") as any)
      .select("id, created_at")
      .eq("project_id", projectId)
      .eq("workflow_id", workflow.id)
      .order("created_at", { ascending: false });

    if (runsError || !runs?.length) {
      return NextResponse.json(
        { documents: [] },
        { status: 200 }
      );
    }

    const runsTyped = runs as { id: string; created_at: string }[];
    const runIds = runsTyped.map((r) => r.id);
    const runCreatedAt = new Map(runsTyped.map((r) => [r.id, r.created_at]));

    // Step 4: Get all documents from rag_run_documents (join rag_documents for title, created_at)
    const { data: runDocs } = await (adminSupabase
      .from("rag_run_documents") as any)
      .select(`
        run_id,
        document_id,
        rag_documents (id, title, created_at)
      `)
      .in("run_id", runIds);

    const docMap = new Map<string, { id: string; title: string; created_at: string; run_id: string }>();
    (runDocs || []).forEach((rd: any) => {
      const doc = rd.rag_documents;
      if (doc && rd.document_id && !docMap.has(rd.document_id)) {
        docMap.set(rd.document_id, {
          id: rd.document_id,
          title: doc.title || "Untitled",
          created_at: doc.created_at || runCreatedAt.get(rd.run_id) || "",
          run_id: rd.run_id,
        });
      }
    });

    // Step 5: Fallback - if rag_run_documents is empty, get from rag_documents.run_id
    if (docMap.size === 0) {
      try {
        const { data: docsByRun } = await (adminSupabase
          .from("rag_documents") as any)
          .select("id, title, created_at, run_id")
          .in("run_id", runIds)
          .is("deleted_at", null)
          .order("created_at", { ascending: false });

        (docsByRun || []).forEach((d: any) => {
          if (d.id && d.run_id && !docMap.has(d.id)) {
            docMap.set(d.id, {
              id: d.id,
              title: d.title || "Untitled",
              created_at: d.created_at || "",
              run_id: d.run_id,
            });
          }
        });
      } catch {
        // rag_documents may not have run_id column
      }
    }

    // Flat list of documents, sorted by created_at DESC (latest first)
    const sorted = Array.from(docMap.values()).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    const documents = sorted.map((d) => ({
      id: d.id,
      title: d.title,
      created_at: d.created_at,
      run_id: d.run_id,
      document_ids: [d.id],
    }));

    return NextResponse.json(
      { documents },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching documents by workflow:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

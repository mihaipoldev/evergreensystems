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

    const { id } = await params;
    const adminSupabase = createServiceRoleClient();

    const { data, error } = await adminSupabase
      .from("rag_runs")
      .select(`
        *,
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
        ),
        rag_run_outputs (
          id,
          output_json
        )
      `)
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Run not found" }, { status: 404 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: "Run not found" }, { status: 404 });
    }

    // Transform data to include knowledge base name, workflow info
    const runData = data as any;

    // Handle projects - it might be null, an object, or an array
    let projectName = null;
    if (runData.projects) {
      if (Array.isArray(runData.projects)) {
        projectName = runData.projects[0]?.name || null;
      } else {
        projectName = runData.projects.name || null;
      }
    }

    const runOutputs = runData.rag_run_outputs;
    const outputJson =
      Array.isArray(runOutputs) && runOutputs.length > 0
        ? runOutputs[0]?.output_json
        : runOutputs?.output_json ?? undefined;
    const report_id =
      Array.isArray(runOutputs) && runOutputs.length > 0
        ? runOutputs[0]?.id ?? null
        : runOutputs?.id ?? null;

    const { extractWorkflowResult } = await import("@/features/rag/runs/utils/extractWorkflowResult");
    const runWithOutput = { ...runData, output_json: outputJson };
    const workflowResult = extractWorkflowResult(runWithOutput);
    const fit_score = workflowResult?.score ?? null;
    const verdict = workflowResult?.verdict ?? null;

    const runWithExtras = {
      ...runData,
      output_json: outputJson,
      knowledge_base_name: runData.rag_knowledge_bases?.name || null,
      project_name: projectName,
      workflow_name: runData.workflows?.slug || null,
      workflow_label: runData.workflows?.name || null,
      report_id,
      fit_score,
      verdict,
    };

    return NextResponse.json(runWithExtras, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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
    const adminSupabase = createServiceRoleClient();

    // Parse request body to check if documents should be deleted
    let deleteDocuments = false;
    try {
      const contentType = request.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const body = await request.json();
        deleteDocuments = body.deleteDocuments === true;
      }
    } catch {
      // If no body or invalid JSON, default to false
      deleteDocuments = false;
    }

    // If deleteDocuments is true, delete documents with this run_id first
    if (deleteDocuments) {
      const { error: documentsError } = await adminSupabase
        .from("rag_documents")
        .delete()
        .eq("run_id", id);

      if (documentsError) {
        return NextResponse.json(
          { error: `Failed to delete documents: ${documentsError.message}` },
          { status: 500 }
        );
      }
    }

    // Delete the run (rag_run_outputs will cascade delete automatically)
    const { error } = await adminSupabase
      .from("rag_runs")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { 
        message: "Run deleted successfully",
        deletedDocuments: deleteDocuments 
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


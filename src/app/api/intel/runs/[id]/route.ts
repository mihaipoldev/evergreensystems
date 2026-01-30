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

    // Fit score and verdict from metadata.evaluation_result (backfilled for legacy
    // niche_fit_evaluation runs by migration 20260129100000)
    const evaluationResult = runData.metadata?.evaluation_result;
    let fit_score: number | null = null;
    let verdict: "pursue" | "test" | "caution" | "avoid" | null = null;
    
    if (evaluationResult && typeof evaluationResult === "object") {
      // Extract and normalize verdict
      if (evaluationResult.verdict && typeof evaluationResult.verdict === "string") {
        const normalizedVerdict = evaluationResult.verdict.toLowerCase();
        if (normalizedVerdict === "pursue" || normalizedVerdict === "test" || normalizedVerdict === "caution" || normalizedVerdict === "avoid") {
          verdict = normalizedVerdict;
        }
      }
      
      // Extract score
      if (typeof evaluationResult.score === "number") {
        fit_score = evaluationResult.score;
      } else if (typeof evaluationResult.score === "string") {
        const parsedScore = parseFloat(evaluationResult.score);
        if (!isNaN(parsedScore)) {
          fit_score = parsedScore;
        }
      }
    }

    const runWithExtras = {
      ...runData,
      knowledge_base_name: runData.rag_knowledge_bases?.name || null,
      project_name: projectName,
      workflow_name: runData.workflows?.slug || null,
      workflow_label: runData.workflows?.name || null,
      report_id: null, // Not loading rag_run_outputs
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


import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { createRun } from "@/features/rag/runs/data";

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
    const projectId = searchParams.get("project_id");
    const subjectId = searchParams.get("subject_id"); // Backward compatibility
    const workflowId = searchParams.get("workflow_id");

    let query = adminSupabase
      .from("rag_runs")
      .select(`
        *,
        rag_knowledge_bases (
          id,
          name
        ),
        workflows (
          id,
          name,
          label
        ),
        projects (
          id,
          name
        ),
        rag_run_outputs (
          id
        )
      `);

    if (status && status !== "All") {
      // Support multiple statuses: comma-separated string like "queued,processing"
      const statuses = status.split(",").map(s => s.trim().toLowerCase()).filter(Boolean);
      if (statuses.length === 1) {
        query = query.eq("status", statuses[0]);
      } else if (statuses.length > 1) {
        query = query.in("status", statuses);
      }
    }

    // Filter by workflow_id
    if (workflowId) {
      query = query.eq("workflow_id", workflowId);
    }

    // Use project_id (new) or subject_id (backward compat)
    const effectiveProjectId = projectId || subjectId;
    if (effectiveProjectId) {
      query = query.eq("project_id", effectiveProjectId);
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

    // Transform data to include knowledge base name, workflow info, and report ID
    const typedData = (data || []) as any[];
    const runsWithKB = typedData.map((run: any) => {
      // Handle rag_run_outputs - it might be an array or single object
      const runOutputs = run.rag_run_outputs;
      
      const reportId = Array.isArray(runOutputs) && runOutputs.length > 0
        ? runOutputs[0].id
        : runOutputs?.id || null;

      // Handle projects - it might be null, an object, or an array
      let projectName = null;
      if (run.projects) {
        if (Array.isArray(run.projects)) {
          projectName = run.projects[0]?.name || null;
        } else {
          projectName = run.projects.name || null;
        }
      }

      return {
        ...run,
        knowledge_base_name: run.rag_knowledge_bases?.name || null,
        project_name: projectName,
        workflow_name: run.workflows?.name || null,
        workflow_label: run.workflows?.label || null,
        report_id: reportId,
      };
    });

    return NextResponse.json(runsWithKB, { status: 200 });
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

    const body = await request.json();
    const {
      knowledge_base_id,
      input,
      metadata,
      workflow_id, // Required
      project_id,
      subject_id, // Backward compatibility
    } = body;

    // Validate required fields
    if (!knowledge_base_id) {
      return NextResponse.json(
        { error: "knowledge_base_id is required" },
        { status: 400 }
      );
    }

    if (!workflow_id) {
      return NextResponse.json(
        { error: "workflow_id is required" },
        { status: 400 }
      );
    }

    if (!input) {
      return NextResponse.json(
        { error: "input is required" },
        { status: 400 }
      );
    }

    // Create the run using the data layer function
    const run = await createRun({
      knowledge_base_id,
      input,
      metadata,
      workflow_id,
      project_id: project_id || null,
      subject_id: subject_id || null, // Backward compatibility
      created_by: user.id,
    });

    return NextResponse.json(run, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unexpected error occurred" },
      { status: 500 }
    );
  }
}


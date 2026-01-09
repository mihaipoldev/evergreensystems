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
    const projectTypeId = searchParams.get("project_type_id");

    // Build projects query
    let query = adminSupabase
      .from("projects")
      .select("*")
      .is("archived_at", null);

    if (status) {
      query = query.eq("status", status);
    }

    if (projectTypeId) {
      query = query.eq("project_type_id", projectTypeId);
    }

    if (search && search.trim() !== "") {
      const searchPattern = `%${search.trim()}%`;
      query = query.ilike("client_name", searchPattern);
    }

    // Parallelize project type check and projects query when projectTypeId is provided
    let isNicheProjectType = false;
    let data: any;
    let error: any;
    
    if (projectTypeId) {
      const projectsQuery = query.order("created_at", { ascending: false });
      const [typeResult, projectsResult] = await Promise.all([
        adminSupabase
          .from("project_types")
          .select("name")
          .eq("id", projectTypeId)
          .single(),
        projectsQuery
      ]) as [
        { data: { name: string } | null; error: any },
        { data: any; error: any }
      ];
      
      if (typeResult.data && typeResult.data.name === "niche") {
        isNicheProjectType = true;
      }
      
      data = projectsResult.data;
      error = projectsResult.error;
    } else {
      // No projectTypeId, just fetch projects
      const projectsResult = await query.order("created_at", { ascending: false });
      data = projectsResult.data;
      error = projectsResult.error;
    }

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const projectIds = (data || []).map((p: any) => p.id);

    // Fetch Niche Intelligence verdict and fit score for niche projects if applicable
    let nicheDataByProject: Map<string, {
      verdict: "pursue" | "test" | "caution" | "avoid" | null;
      fit_score: number | null;
      updated_at: string | null;
      runs: Array<{
        verdict: "pursue" | "test" | "caution" | "avoid" | null;
        fit_score: number | null;
        updated_at: string | null;
        status: "complete" | "queued" | "collecting" | "ingesting" | "generating" | "processing" | "failed";
      }>;
    }> = new Map();

    if (isNicheProjectType && projectIds.length > 0) {
      // First, get the niche_fit_evaluation workflow ID
      const { data: nicheFitEvalWorkflow } = await adminSupabase
        .from("workflows")
        .select("id")
        .eq("name", "niche_fit_evaluation")
        .single();

      if (nicheFitEvalWorkflow) {
        // Fetch both complete and in-progress niche_fit_evaluation workflow runs for these projects
        // Filter by status at DB level for better performance
        // Index idx_rag_runs_project_workflow_status_created is used here
        // Include all in-progress statuses: queued, collecting, ingesting, generating, processing
        const { data: runsData, error: runsError } = await adminSupabase
          .from("rag_runs")
          .select(`
            id,
            project_id,
            status,
            metadata,
            updated_at
          `)
          .in("project_id", projectIds)
          .eq("workflow_id", (nicheFitEvalWorkflow as any).id)
          .in("status", ["complete", "queued", "collecting", "ingesting", "generating", "processing"])
          .order("created_at", { ascending: false });

        if (!runsError && runsData) {
          // Group all runs by project (already sorted by created_at DESC)
          const runsByProject = new Map<string, typeof runsData>();
          for (const run of runsData) {
            const projectId = (run as any).project_id;
            if (!projectId) continue;
            
            if (!runsByProject.has(projectId)) {
              runsByProject.set(projectId, []);
            }
            runsByProject.get(projectId)!.push(run);
          }

          // Optimized: Extract evaluation result from metadata (matching extractWorkflowResult logic)
          const processRunMetadata = (id: string, metadata: any, updatedAt: string | null, status: string): { id: string; verdict: "pursue" | "test" | "caution" | "avoid" | null; fit_score: number | null; updated_at: string | null; status: "complete" | "queued" | "collecting" | "ingesting" | "generating" | "processing" | "failed" } => {
            let verdict: "pursue" | "test" | "caution" | "avoid" | null = null;
            let fitScore: number | null = null;
            
            // Access evaluation_result from metadata
            const evaluationResult = metadata?.evaluation_result;
            
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
                fitScore = evaluationResult.score;
              } else if (typeof evaluationResult.score === "string") {
                const parsedScore = parseFloat(evaluationResult.score);
                if (!isNaN(parsedScore)) {
                  fitScore = parsedScore;
                }
              }
            }
            
            // Preserve the actual status from the database
            const validStatuses = ["complete", "queued", "collecting", "ingesting", "generating", "processing", "failed"] as const;
            const normalizedStatus = validStatuses.includes(status as any) ? status as typeof validStatuses[number] : "complete";
            return { id, verdict, fit_score: fitScore, updated_at: updatedAt, status: normalizedStatus };
          };

          // Process all runs for each project
          for (const [projectId, runs] of runsByProject.entries()) {
            // Process all runs - include complete ones with data and in-progress ones
            const processedRuns = runs
              .map(run => {
                const id = (run as any).id;
                const metadata = (run as any).metadata;
                const updatedAt = (run as any).updated_at || null;
                const status = (run as any).status || "complete";
                return processRunMetadata(id, metadata, updatedAt, status);
              })
              .filter(run => {
                // Include complete runs with data OR any in-progress runs (queued, collecting, ingesting, generating, processing)
                const isComplete = run.status === "complete";
                const isInProgress = ["queued", "collecting", "ingesting", "generating", "processing"].includes(run.status);
                return (isComplete && (run.verdict !== null || run.fit_score !== null)) || isInProgress;
              });

            if (processedRuns.length > 0) {
              // Find the latest COMPLETED run for the main display (table)
              // Keep all runs (including processing) for the tooltip
              const latestCompletedRun = processedRuns.find(run => run.status === "complete" && (run.verdict !== null || run.fit_score !== null));
              
              // If we have a completed run, use it for the main display
              // Otherwise, use the first run (which might be processing)
              const displayRun = latestCompletedRun || processedRuns[0];
              
              nicheDataByProject.set(projectId, {
                verdict: displayRun.verdict,
                fit_score: displayRun.fit_score,
                updated_at: displayRun.updated_at,
                runs: processedRuns,
              });
            }
          }
        }
      }
    }

    // Attach niche intelligence verdict and fit score to projects
    const projectsWithNicheData = (data || []).map((project: any) => {
      const nicheData = nicheDataByProject.get(project.id);
      return {
        ...project,
        ...(nicheData ? {
          niche_intelligence_verdict: nicheData.verdict,
          niche_intelligence_fit_score: nicheData.fit_score,
          niche_intelligence_updated_at: nicheData.updated_at,
          niche_intelligence_runs: nicheData.runs,
        } : {}),
      };
    });

    return NextResponse.json(projectsWithNicheData, { status: 200 });
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
    const { 
      project_type_id, 
      client_name, 
      name, 
      status, 
      description, 
      geography, 
      category 
    } = body;

    // Validate project_type_id
    if (!project_type_id) {
      return NextResponse.json(
        { error: "project_type_id is required" },
        { status: 400 }
      );
    }

    // Get project type to determine which fields are required
    const { data: projectType } = await adminSupabase
      .from("project_types")
      .select("name")
      .eq("id", project_type_id)
      .single();

    if (!projectType) {
      return NextResponse.json(
        { error: "Invalid project_type_id" },
        { status: 400 }
      );
    }

    const typedProjectType = projectType as { name: string };
    const isClientType = typedProjectType.name === "client";
    const isNicheType = typedProjectType.name === "niche";

    // Validate based on project type
    if (isClientType && !client_name) {
      return NextResponse.json(
        { error: "client_name is required for client projects" },
        { status: 400 }
      );
    }

    if (isNicheType && !name) {
      return NextResponse.json(
        { error: "name is required for niche research projects" },
        { status: 400 }
      );
    }

    // Determine display name for KB
    const displayName = isClientType ? client_name : name;

    // Step 1: Create workspace KB for this project
    const kbName = isClientType 
      ? `${client_name} Knowledge Base`
      : `${name} Knowledge Base`;
    
    const { data: kb, error: kbError } = await (adminSupabase
      .from("rag_knowledge_bases") as any)
      .insert({
        name: kbName,
        description: `Knowledge Base for ${displayName} project`,
        type: "project",
        kb_type: isClientType ? "client" : "project",
        is_active: true,
        created_by: user.id,
      })
      .select()
      .single();

    if (kbError) {
      return NextResponse.json({ error: kbError.message }, { status: 500 });
    }

    if (!kb) {
      return NextResponse.json(
        { error: "Failed to create workspace KB" },
        { status: 500 }
      );
    }

    // Step 2: Create project with reference to workspace KB
    const projectData: any = {
      project_type_id,
      status: status || "active",
      description: description || null,
      kb_id: kb.id, // Required - links to workspace KB
      created_by: user.id,
    };

    // Add type-specific fields
    if (isClientType) {
      projectData.client_name = client_name;
      projectData.name = client_name; // Set name to client_name for consistency
    } else if (isNicheType) {
      projectData.name = name;
      projectData.geography = geography || null;
      projectData.category = category || null;
      projectData.client_name = name; // Set client_name to name for backward compatibility
    }

    const { data, error } = await (adminSupabase
      .from("projects") as any)
      .insert(projectData)
      .select()
      .single();

    if (error) {
      // If project creation fails, clean up the KB we just created
      await adminSupabase.from("rag_knowledge_bases").delete().eq("id", kb.id);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unexpected error occurred" },
      { status: 500 }
    );
  }
}


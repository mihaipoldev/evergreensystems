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
      verdict: "pursue" | "test" | "avoid" | null;
      fit_score: number | null;
    }> = new Map();

    if (isNicheProjectType && projectIds.length > 0) {
      // First, get the niche_intelligence workflow ID
      const { data: nicheIntelWorkflow } = await adminSupabase
        .from("workflows")
        .select("id")
        .eq("name", "niche_intelligence")
        .single();

      if (nicheIntelWorkflow) {
        // Fetch only complete niche_intelligence workflow runs for these projects
        // Filter by status at DB level for better performance
        const { data: runsData, error: runsError } = await adminSupabase
          .from("rag_runs")
          .select(`
            id,
            project_id,
            status,
            rag_run_outputs!inner (
              id,
              output_json
            )
          `)
          .in("project_id", projectIds)
          .eq("workflow_id", (nicheIntelWorkflow as any).id)
          .eq("status", "complete")
          .order("created_at", { ascending: false });

        if (!runsError && runsData) {
          // Use Map to get latest run per project (already sorted by created_at DESC)
          // Since we're filtering for complete runs at DB level, all runs are complete
          const latestRunByProject = new Map<string, typeof runsData[0]>();
          for (const run of runsData) {
            const projectId = (run as any).project_id;
            if (!projectId) continue;
            
            // Only keep the first (latest) run per project
            if (!latestRunByProject.has(projectId)) {
              latestRunByProject.set(projectId, run);
            }
          }

          // Process each project's latest complete run
          for (const [projectId, run] of latestRunByProject.entries()) {
            const runOutputs = (run as any).rag_run_outputs;
            let verdict: "pursue" | "test" | "avoid" | null = null;
            let fitScore: number | null = null;
            
            // Extract verdict and fit_score from report JSONB
            if (runOutputs && Array.isArray(runOutputs) && runOutputs.length > 0) {
              const outputJsonRaw = runOutputs[0]?.output_json;
              if (outputJsonRaw) {
                try {
                  // Handle both string and object formats
                  const outputJson = typeof outputJsonRaw === "string" 
                    ? JSON.parse(outputJsonRaw) 
                    : outputJsonRaw;
                  
                  if (outputJson && typeof outputJson === "object") {
                    // Try to extract from data.lead_gen_strategy first (ReportData structure)
                    // Then fallback to lead_gen_strategy directly (alternative structure)
                    const leadGenStrategy = (outputJson as any)?.data?.lead_gen_strategy 
                      || (outputJson as any)?.lead_gen_strategy;
                    
                    if (leadGenStrategy) {
                      if (leadGenStrategy.verdict && 
                          ["pursue", "test", "avoid"].includes(leadGenStrategy.verdict)) {
                        verdict = leadGenStrategy.verdict;
                      }
                      if (typeof leadGenStrategy.lead_gen_fit_score === "number") {
                        fitScore = leadGenStrategy.lead_gen_fit_score;
                      }
                    }
                  }
                } catch (e) {
                  // Silently fail - verdict and fit_score will remain null
                  console.error("Error parsing output_json:", e);
                }
              }
            }
            
            nicheDataByProject.set(projectId, { verdict, fit_score: fitScore });
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


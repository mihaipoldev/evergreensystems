import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate user
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: workflowId } = await params;
    const body = await request.json();
    const { project_id, research_subject_id, workflow_id, input } = body;

    // Accept both project_id (new) and research_subject_id (backward compat)
    const effectiveProjectId = project_id || research_subject_id;

    if (!effectiveProjectId) {
      return NextResponse.json(
        { error: "project_id or research_subject_id is required" },
        { status: 400 }
      );
    }

    // Use workflow_id from body if provided, otherwise fall back to URL param
    const effectiveWorkflowId = workflow_id || workflowId;

    // Use service role client to access secrets and research data
    const adminSupabase = createServiceRoleClient();

    // Fetch workflow to get knowledge_base_target and target_knowledge_base_id
    const { data: workflow, error: workflowError } = await (adminSupabase
      .from("workflows") as any)
      .select("knowledge_base_target, target_knowledge_base_id")
      .eq("id", effectiveWorkflowId)
      .single();

    if (workflowError) {
      if (workflowError.code === "PGRST116") {
        return NextResponse.json(
          { error: "Workflow not found" },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: `Failed to fetch workflow: ${workflowError.message}` },
        { status: 500 }
      );
    }

    if (!workflow) {
      return NextResponse.json(
        { error: "Workflow not found" },
        { status: 404 }
      );
    }

    const workflowTyped = workflow as { 
      knowledge_base_target: string; 
      target_knowledge_base_id: string | null 
    };

    // Fetch webhook URL from workflow_secrets
    const { data: secrets, error: secretsError } = await (adminSupabase
      .from("workflow_secrets") as any)
      .select("webhook_url")
      .eq("workflow_id", effectiveWorkflowId)
      .single();
    const secretsTyped = secrets as { webhook_url: string } | null;

    if (secretsError) {
      if (secretsError.code === "PGRST116") {
        return NextResponse.json(
          { error: "Webhook URL not configured for this workflow" },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: `Failed to fetch webhook: ${secretsError.message}` },
        { status: 500 }
      );
    }

    if (!secretsTyped?.webhook_url) {
      return NextResponse.json(
        { error: "Webhook URL not configured for this workflow" },
        { status: 404 }
      );
    }

    // Fetch project data (research subject is now a project) - include kb_id
    const { data: project, error: projectError } = await (adminSupabase
      .from("projects") as any)
      .select("name, geography, category, description, kb_id")
      .eq("id", effectiveProjectId)
      .single();

    if (projectError) {
      if (projectError.code === "PGRST116") {
        return NextResponse.json(
          { error: "Project not found" },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: `Failed to fetch project: ${projectError.message}` },
        { status: 500 }
      );
    }

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    const projectTyped = project as { 
      name: string; 
      geography: string | null; 
      category: string | null; 
      description: string | null;
      kb_id: string | null;
    };

    // Determine knowledge_base_id based on workflow.knowledge_base_target
    let knowledgeBaseId: string | null = null;
    
    if (workflowTyped.knowledge_base_target === 'knowledgebase') {
      knowledgeBaseId = workflowTyped.target_knowledge_base_id;
    } else {
      // For 'client' or 'project', use the project's kb_id
      knowledgeBaseId = projectTyped.kb_id;
    }

    // Validate knowledge_base_id is not null
    if (!knowledgeBaseId) {
      if (workflowTyped.knowledge_base_target === 'knowledgebase') {
        return NextResponse.json(
          { error: "Workflow target_knowledge_base_id is not configured" },
          { status: 400 }
        );
      } else {
        return NextResponse.json(
          { error: "Project kb_id is not configured" },
          { status: 400 }
        );
      }
    }

    // Create rag_runs record with status='processing'
    const { data: run, error: runError } = await (adminSupabase
      .from("rag_runs") as any)
      .insert({
        knowledge_base_id: knowledgeBaseId,
        workflow_id: effectiveWorkflowId,
        project_id: effectiveProjectId,
        status: 'processing',
        created_by: user.id,
        input: input || {},
        metadata: {},
      })
      .select()
      .single();

    if (runError) {
      console.error("Error creating rag_runs record:", runError);
      return NextResponse.json(
        { error: `Failed to create run: ${runError.message}` },
        { status: 500 }
      );
    }

    if (!run || !run.id) {
      return NextResponse.json(
        { error: "Failed to create run: no run ID returned" },
        { status: 500 }
      );
    }

    const runId = run.id;

    // Prepare webhook payload - include run_id so external service can update run status
    const webhookPayload = {
      Name: projectTyped.name || "",
      Geography: projectTyped.geography || "",
      Category: projectTyped.category || "",
      Description: projectTyped.description || "",
      UserId: user.id,
      WorkflowId: effectiveWorkflowId,
      ProjectId: effectiveProjectId,
      RunId: runId, // Include run_id in payload
      ...(input && { Input: input }),
    };

    // Send POST request to webhook
    try {
      const webhookResponse = await fetch(secretsTyped.webhook_url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(webhookPayload),
      });

      if (!webhookResponse.ok) {
        const errorText = await webhookResponse.text().catch(() => "Unknown error");
        return NextResponse.json(
          {
            success: false,
            error: `Webhook returned error: ${webhookResponse.status} ${webhookResponse.statusText}`,
            details: errorText,
          },
          { status: 500 }
        );
      }

      // Try to parse response if available
      let responseData;
      try {
        responseData = await webhookResponse.json();
      } catch {
        // If response is not JSON, that's okay
        responseData = { message: "Workflow executed successfully" };
      }

      return NextResponse.json(
        {
          success: true,
          message: "Workflow executed successfully",
          run_id: runId, // Include run_id in response for navigation
          data: responseData,
        },
        { status: 200 }
      );
    } catch (fetchError: any) {
      console.error("Error calling webhook:", fetchError);
      return NextResponse.json(
        {
          success: false,
          error: `Failed to call webhook: ${fetchError.message || "Network error"}`,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error executing workflow:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}


import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    
    // Use service role to check if secrets exist (but don't return them)
    const adminSupabase = createServiceRoleClient();
    const { data, error } = await (adminSupabase
      .from("workflow_secrets") as any)
      .select("workflow_id, created_at, updated_at") // Only return metadata, NOT secrets
      .eq("workflow_id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ exists: false }, { status: 200 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const dataTyped = data as { workflow_id: string; created_at: string; updated_at: string } | null;

    // Return only metadata, never the actual secrets
    return NextResponse.json({ 
      exists: true,
      created_at: dataTyped?.created_at,
      updated_at: dataTyped?.updated_at
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { webhook_url, api_key, config } = body;

    // Validate required fields
    if (!webhook_url || typeof webhook_url !== "string") {
      return NextResponse.json(
        { error: "webhook_url is required and must be a string" },
        { status: 400 }
      );
    }

    // Validate webhook URL format
    try {
      new URL(webhook_url);
    } catch {
      return NextResponse.json(
        { error: "webhook_url must be a valid URL" },
        { status: 400 }
      );
    }

    // Verify workflow exists
    const adminSupabase = createServiceRoleClient();
    const { data: workflow, error: workflowError } = await adminSupabase
      .from("workflows")
      .select("id")
      .eq("id", id)
      .single();

    if (workflowError || !workflow) {
      return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
    }

    // Check if secrets already exist
    const { data: existing } = await adminSupabase
      .from("workflow_secrets")
      .select("workflow_id")
      .eq("workflow_id", id)
      .single();

    const updateData: Record<string, any> = {
      webhook_url,
      updated_at: new Date().toISOString(),
    };

    if (api_key !== undefined) {
      updateData.api_key = api_key || null;
    }

    if (config !== undefined) {
      // Validate config is valid JSON if provided
      if (config !== null && typeof config !== "object") {
        return NextResponse.json(
          { error: "config must be a valid JSON object or null" },
          { status: 400 }
        );
      }
      updateData.config = config || null;
    }

    let result;
    if (existing) {
      // Update existing secrets
      const { data, error } = await (adminSupabase
        .from("workflow_secrets") as any)
        .update(updateData)
        .eq("workflow_id", id)
        .select("workflow_id, created_at, updated_at") // Never return secrets
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      result = data;
    } else {
      // Insert new secrets
      const { data, error } = await (adminSupabase
        .from("workflow_secrets") as any)
        .insert({
          workflow_id: id,
          ...updateData,
        })
        .select("workflow_id, created_at, updated_at") // Never return secrets
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      result = data;
    }

    // Return only metadata, never the actual secrets
    return NextResponse.json({
      success: true,
      workflow_id: result.workflow_id,
      updated_at: result.updated_at,
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unexpected error occurred" },
      { status: 500 }
    );
  }
}


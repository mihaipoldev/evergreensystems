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
    const { data, error } = await adminSupabase
      .from("workflows")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
    }

    return NextResponse.json(data, { status: 200 });
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
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminSupabase = createServiceRoleClient();

    const { id } = await params;
    const body = await request.json();
    const { slug, name, description, icon, estimated_cost, estimated_time_minutes, default_ai_model, default_synthesis_ai_model, input_schema, enabled, knowledge_base_target, target_knowledge_base_id } = body;

    // Validate default_ai_model if provided
    if (default_ai_model !== undefined) {
      const validModels = [
        'anthropic/claude-sonnet-4.5',
        'anthropic/claude-haiku-4.5',
        'google/gemini-3-flash-preview',
        'google/gemini-3-pro-preview',
        'openai/gpt-4o-mini',
        'openai/gpt-4o',
        'openai/gpt-5-mini',
        'openai/gpt-5.2'
      ];
      if (!validModels.includes(default_ai_model)) {
        return NextResponse.json(
          { error: "default_ai_model must be one of the allowed models" },
          { status: 400 }
        );
      }
    }

    // Validate default_synthesis_ai_model if provided
    if (default_synthesis_ai_model !== undefined) {
      const validModels = [
        'anthropic/claude-sonnet-4.5',
        'anthropic/claude-haiku-4.5',
        'google/gemini-3-flash-preview',
        'google/gemini-3-pro-preview',
        'openai/gpt-4o-mini',
        'openai/gpt-4o',
        'openai/gpt-5-mini',
        'openai/gpt-5.2'
      ];
      if (!validModels.includes(default_synthesis_ai_model)) {
        return NextResponse.json(
          { error: "default_synthesis_ai_model must be one of the allowed models" },
          { status: 400 }
        );
      }
    }

    // Validate knowledge_base_target if provided
    if (knowledge_base_target !== undefined && !['knowledgebase', 'client', 'project'].includes(knowledge_base_target)) {
      return NextResponse.json(
        { error: "knowledge_base_target must be one of: knowledgebase, client, project" },
        { status: 400 }
      );
    }

    const updateData: Record<string, any> = {};
    if (slug !== undefined) updateData.slug = slug;
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description || null;
    if (icon !== undefined) updateData.icon = icon || null;
    if (estimated_cost !== undefined) updateData.estimated_cost = estimated_cost !== null ? estimated_cost : null;
    if (estimated_time_minutes !== undefined) updateData.estimated_time_minutes = estimated_time_minutes !== null ? estimated_time_minutes : null;
    if (default_ai_model !== undefined) updateData.default_ai_model = default_ai_model;
    if (default_synthesis_ai_model !== undefined) updateData.default_synthesis_ai_model = default_synthesis_ai_model;
    if (input_schema !== undefined) updateData.input_schema = input_schema || null;
    if (enabled !== undefined) updateData.enabled = enabled;
    if (knowledge_base_target !== undefined) updateData.knowledge_base_target = knowledge_base_target;
    if (target_knowledge_base_id !== undefined) updateData.target_knowledge_base_id = target_knowledge_base_id || null;

    // If slug is being updated, check for uniqueness
    if (slug !== undefined) {
      const { data: existing } = await adminSupabase
        .from("workflows")
        .select("id")
        .eq("slug", slug)
        .neq("id", id)
        .single();

      if (existing) {
        return NextResponse.json(
          { error: "A workflow with this slug already exists" },
          { status: 400 }
        );
      }
    }

    const { data, error } = await (adminSupabase
      .from("workflows") as any)
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 200 });
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

    const adminSupabase = createServiceRoleClient();

    const { id } = await params;
    
    const { error } = await adminSupabase
      .from("workflows")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Workflow deleted successfully" }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unexpected error occurred" },
      { status: 500 }
    );
  }
}


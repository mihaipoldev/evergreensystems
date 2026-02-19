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
    const enabled = searchParams.get("enabled");
    const search = searchParams.get("search");

    let query = adminSupabase
      .from("workflows")
      .select("*");

    // Filter by enabled status if specified
    if (enabled !== null && enabled !== undefined) {
      if (enabled === "true") {
        query = query.eq("enabled", true);
      } else if (enabled === "false") {
        query = query.eq("enabled", false);
      }
    } else {
      // Default: only show enabled workflows
      query = query.eq("enabled", true);
    }

    if (search && search.trim() !== "") {
      const searchPattern = `%${search.trim()}%`;
      query = query.or(`slug.ilike.${searchPattern},name.ilike.${searchPattern}`);
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data || [], {
      status: 200,
      headers: {
        "Cache-Control": "private, max-age=300, stale-while-revalidate=600",
      },
    });
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
    const { slug, name, description, icon, estimated_cost, estimated_time_minutes, default_ai_model, default_synthesis_ai_model, input_schema, enabled, knowledge_base_target, target_knowledge_base_id } = body;

    if (!slug || !name) {
      return NextResponse.json(
        { error: "slug and name are required" },
        { status: 400 }
      );
    }

    // Validate default_ai_model
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
    if (!default_ai_model || !validModels.includes(default_ai_model)) {
      return NextResponse.json(
        { error: "default_ai_model is required and must be one of the allowed models" },
        { status: 400 }
      );
    }

    // Validate default_synthesis_ai_model (optional, fallback to default_ai_model)
    const effectiveSynthesisModel = default_synthesis_ai_model || default_ai_model;
    if (!validModels.includes(effectiveSynthesisModel)) {
      return NextResponse.json(
        { error: "default_synthesis_ai_model must be one of the allowed models" },
        { status: 400 }
      );
    }

    // Validate knowledge_base_target
    if (!knowledge_base_target || !['knowledgebase', 'client', 'project'].includes(knowledge_base_target)) {
      return NextResponse.json(
        { error: "knowledge_base_target is required and must be one of: knowledgebase, client, project" },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const { data: existing } = await adminSupabase
      .from("workflows")
      .select("id")
      .eq("slug", slug)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "A workflow with this slug already exists" },
        { status: 400 }
      );
    }

    const { data, error } = await (adminSupabase
      .from("workflows") as any)
      .insert({
        slug,
        name,
        description: description || null,
        icon: icon || null,
        estimated_cost: estimated_cost !== undefined ? estimated_cost : null,
        estimated_time_minutes: estimated_time_minutes !== undefined ? estimated_time_minutes : null,
        default_ai_model: default_ai_model,
        default_synthesis_ai_model: effectiveSynthesisModel,
        input_schema: input_schema || null,
        enabled: enabled !== undefined ? enabled : true,
        knowledge_base_target: knowledge_base_target,
        target_knowledge_base_id: target_knowledge_base_id || null,
      })
      .select()
      .single();

    if (error) {
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


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
      query = query.or(`name.ilike.${searchPattern},label.ilike.${searchPattern}`);
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data || [], { status: 200 });
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
    const { name, label, description, icon, estimated_cost, estimated_time_minutes, input_schema, enabled } = body;

    if (!name || !label) {
      return NextResponse.json(
        { error: "name and label are required" },
        { status: 400 }
      );
    }

    // Check if name already exists
    const { data: existing } = await adminSupabase
      .from("workflows")
      .select("id")
      .eq("name", name)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "A workflow with this name already exists" },
        { status: 400 }
      );
    }

    const { data, error } = await (adminSupabase
      .from("workflows") as any)
      .insert({
        name,
        label,
        description: description || null,
        icon: icon || null,
        estimated_cost: estimated_cost !== undefined ? estimated_cost : null,
        estimated_time_minutes: estimated_time_minutes !== undefined ? estimated_time_minutes : null,
        input_schema: input_schema || null,
        enabled: enabled !== undefined ? enabled : true,
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


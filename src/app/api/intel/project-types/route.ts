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

    let query = adminSupabase
      .from("project_types")
      .select("*");

    // Filter by enabled status if specified
    if (enabled !== null && enabled !== undefined) {
      if (enabled === "true") {
        query = query.eq("enabled", true);
      } else if (enabled === "false") {
        query = query.eq("enabled", false);
      }
    } else {
      // Default: only show enabled project types
      query = query.eq("enabled", true);
    }

    const { data, error } = await query.order("name", { ascending: true });

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
    const { name, label, description, icon, enabled } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "name is required" },
        { status: 400 }
      );
    }

    if (!label || !label.trim()) {
      return NextResponse.json(
        { error: "label is required" },
        { status: 400 }
      );
    }

    // Check if name already exists
    const { data: existing } = await adminSupabase
      .from("project_types")
      .select("id")
      .eq("name", name.trim())
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "A project type with this name already exists" },
        { status: 400 }
      );
    }

    const { data, error } = await (adminSupabase
      .from("project_types") as any)
      .insert({
        name: name.trim(),
        label: label.trim(),
        description: description?.trim() || null,
        icon: icon?.trim() || null,
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


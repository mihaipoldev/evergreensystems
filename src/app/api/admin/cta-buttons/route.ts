import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Use service role client to bypass RLS for admin operations
    const adminSupabase = createServiceRoleClient();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");

    let query = adminSupabase
      .from("cta_buttons")
      .select("id, label, url, subtitle, style, icon, position, created_at, updated_at");

    // Server-side search filtering
    if (search && search.trim() !== "") {
      const searchPattern = `%${search.trim()}%`;
      query = query.or(`label.ilike.${searchPattern},url.ilike.${searchPattern}`);
    }

    const { data, error } = await query.order("position", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // No cache for admin routes - always fresh data
    return NextResponse.json(data, {
      status: 200,
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
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

    // Use service role client to bypass RLS for admin operations
    const adminSupabase = createServiceRoleClient();

    const body = await request.json();
    const { label, url, subtitle, style, icon, position } = body;

    if (!label || !url) {
      return NextResponse.json(
        { error: "label and url are required" },
        { status: 400 }
      );
    }

    const { data, error } = await (adminSupabase
      .from("cta_buttons") as any)
      .insert({
        label,
        url,
        subtitle: subtitle || null,
        style: style || null,
        icon: icon || null,
        position: position ?? 0,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Invalidate cache for CTA buttons
    revalidateTag("cta-buttons", "max");

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

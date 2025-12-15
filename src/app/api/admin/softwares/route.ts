import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

export async function GET(request: Request) {
  try {
    // Check authentication first using regular client
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Use service role client for admin operations to bypass RLS
    const adminSupabase = createServiceRoleClient();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");

    let query = adminSupabase
      .from("softwares")
      .select("id, name, slug, website_url, icon, created_at, updated_at");

    // Server-side search filtering
    if (search && search.trim() !== "") {
      const searchPattern = `%${search.trim()}%`;
      query = query.or(`name.ilike.${searchPattern},slug.ilike.${searchPattern},website_url.ilike.${searchPattern}`);
    }

    const { data, error } = await query.order("name", { ascending: true });

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
    // Check authentication first using regular client
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Use service role client for admin operations to bypass RLS
    const adminSupabase = createServiceRoleClient();

    const body = await request.json();
    const { name, slug, website_url, icon } = body;

    if (!name || !slug || !website_url) {
      return NextResponse.json(
        { error: "name, slug, and website_url are required" },
        { status: 400 }
      );
    }

    const { data, error } = await (adminSupabase.from("softwares") as any)
      .insert({
        name,
        slug,
        website_url,
        icon: icon || null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Invalidate cache for softwares
    revalidateTag("softwares", "max");

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

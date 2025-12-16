import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { page_type, production_page_id, development_page_id, slug } = body;

    if (!page_type || !slug) {
      return NextResponse.json(
        { error: "page_type and slug are required" },
        { status: 400 }
      );
    }

    // Check if entry exists
    const { data: existing } = await supabase
      .from("site_structure")
      .select("id")
      .eq("page_type", page_type)
      .maybeSingle();

    if (existing) {
      // Update existing entry
      const { error } = await (supabase
        .from("site_structure") as any)
        .update({
          production_page_id: production_page_id || null,
          development_page_id: development_page_id || null,
          slug,
          updated_at: new Date().toISOString(),
        })
        .eq("page_type", page_type);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    } else {
      // Create new entry
      const { error } = await (supabase
        .from("site_structure") as any)
        .insert({
          page_type,
          slug,
          production_page_id: production_page_id || null,
          development_page_id: development_page_id || null,
        });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    // Invalidate cache
    revalidateTag("site-structure", "max");
    revalidateTag(`page-slug-${slug}`, "max");

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

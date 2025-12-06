import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const pageId = searchParams.get("page_id");

    // If pageId is provided, get sections via page_sections junction table
    if (pageId) {
      const { data: pageSections, error: pageSectionsError } = await supabase
        .from("page_sections")
        .select(`
          section_id,
          sections (*)
        `)
        .eq("page_id", pageId)
        .order("position", { ascending: true });

      if (pageSectionsError) {
        return NextResponse.json({ error: pageSectionsError.message }, { status: 500 });
      }

      const sections = (pageSections || []).map((ps: any) => ({
        ...ps.sections,
        page_section_id: ps.section_id,
      }));

      return NextResponse.json(sections, { status: 200 });
    }

    // Otherwise return all sections
    const { data, error } = await supabase
      .from("sections")
      .select("*")
      .order("created_at", { ascending: false });

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

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { type, title, admin_title, subtitle, content, media_url } = body;

    if (!type) {
      return NextResponse.json(
        { error: "type is required" },
        { status: 400 }
      );
    }

    // Create section (no page_id, position, or visible - those are in page_sections)
    const { data: section, error: sectionError } = await (supabase
      .from("sections") as any)
      .insert({
        type,
        title: title || null,
        admin_title: admin_title || null,
        subtitle: subtitle || null,
        content: content || null,
        media_url: media_url || null,
      })
      .select()
      .single();

    if (sectionError) {
      return NextResponse.json({ error: sectionError.message }, { status: 500 });
    }

    return NextResponse.json(section, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

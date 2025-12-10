import { createClient } from "@/lib/supabase/server";
import { getAllSections } from "@/features/sections/data";
import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const pageId = searchParams.get("page_id");
    const search = searchParams.get("search");

    // If pageId is provided, get sections via page_sections junction table
    if (pageId) {
      const { data: pageSections, error: pageSectionsError } = await supabase
        .from("page_sections")
        .select(`
          id,
          section_id,
          position,
          visible,
          sections (id, type, title, admin_title, subtitle, content, media_url, created_at, updated_at)
        `)
        .eq("page_id", pageId)
        .order("position", { ascending: true });

      if (pageSectionsError) {
        return NextResponse.json({ error: pageSectionsError.message }, { status: 500 });
      }

      const sections = (pageSections || [])
        .filter((ps: any) => ps.sections !== null)
        .map((ps: any) => ({
          ...ps.sections,
          page_section_id: ps.id,
          position: ps.position ?? 0,
          visible: ps.visible !== undefined && ps.visible !== null ? Boolean(ps.visible) : true,
        }));

      // No cache for admin routes - always fresh data
      return NextResponse.json(sections, {
        status: 200,
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      });
    }

    // Otherwise return all sections using the same ordering as getAllSections:
    // home page sections by position first, then non-home sections alphabetically.
    const sections = await getAllSections();

    const filteredSections =
      search && search.trim() !== ""
        ? sections.filter((section) => {
            const needle = search.trim().toLowerCase();
            return (
              (section.title || "").toLowerCase().includes(needle) ||
              (section.admin_title || "").toLowerCase().includes(needle) ||
              (section.subtitle || "").toLowerCase().includes(needle) ||
              (section.type || "").toLowerCase().includes(needle)
            );
          })
        : sections;

    // No cache for admin routes - always fresh data
    return NextResponse.json(filteredSections, {
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

    // Invalidate cache for sections
    revalidateTag("sections", "max");

    return NextResponse.json(section, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

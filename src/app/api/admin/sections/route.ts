import { createClient } from "@/lib/supabase/server";
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
    
    console.log("🔍 [API /admin/sections] GET request:", {
      url: request.url,
      pageId,
      search,
      allParams: Object.fromEntries(searchParams.entries()),
    });

    // If pageId is provided, get sections via page_sections junction table
    if (pageId) {
      const { data: pageSections, error: pageSectionsError } = await supabase
        .from("page_sections")
        .select(`
          id,
          section_id,
          position,
          status,
          sections (id, type, title, admin_title, header_title, subtitle, eyebrow, content, media_url, icon, created_at, updated_at)
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
          status: ps.status || "draft",
        }));

      // No cache for admin routes - always fresh data
      return NextResponse.json(sections, {
        status: 200,
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      });
    }

    // Otherwise return all sections - query directly from database
    // Get all sections (user is authenticated, so RLS should allow this)
    const { data: sections, error: sectionsError } = await supabase
      .from("sections")
      .select("id, type, title, admin_title, header_title, subtitle, eyebrow, content, media_url, icon, created_at, updated_at")
      .order("admin_title", { ascending: true, nullsFirst: false });

    if (sectionsError) {
      console.error("❌ [API /admin/sections] Error fetching sections:", {
        error: sectionsError,
        message: sectionsError.message,
      });
      return NextResponse.json(
        { error: sectionsError.message || "Failed to fetch sections" },
        { status: 500 }
      );
    }

    console.log("🔍 [API /admin/sections] Fetched sections from database:", {
      count: sections?.length || 0,
      sections: sections?.map((s: any) => ({ id: s.id, title: s.title || s.admin_title || s.type })) || [],
    });

    const allSections: Array<{
      id: string;
      type: string;
      title: string | null;
      admin_title: string | null;
      subtitle: string | null;
      eyebrow: string | null;
      content: any;
      media_url: string | null;
      icon?: string | null;
      created_at: string;
      updated_at: string;
    }> = sections || [];

    const filteredSections =
      search && search.trim() !== ""
        ? allSections.filter((section) => {
            const needle = search.trim().toLowerCase();
            return (
              (section.title || "").toLowerCase().includes(needle) ||
              (section.admin_title || "").toLowerCase().includes(needle) ||
              (section.subtitle || "").toLowerCase().includes(needle) ||
              (section.type || "").toLowerCase().includes(needle)
            );
          })
        : allSections;

    console.log("🔍 [API /admin/sections] Returning filtered sections:", {
      search,
      originalCount: allSections.length,
      filteredCount: filteredSections.length,
      filteredSections: filteredSections.map((s: any) => ({ id: s.id, title: s.title || s.admin_title || s.type })),
    });

    // No cache for admin routes - always fresh data
    return NextResponse.json(filteredSections, {
      status: 200,
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (error) {
    console.error("❌ [API /admin/sections] Top-level error:", {
      error,
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "An unexpected error occurred",
        details: process.env.NODE_ENV === "development" ? String(error) : undefined
      },
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
    const { type, title, admin_title, header_title, subtitle, content, media_url, icon } = body;

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
        header_title: header_title || null,
        subtitle: subtitle || null,
        content: content || null,
        media_url: media_url || null,
        icon: icon && icon.trim() ? icon.trim() : null,
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

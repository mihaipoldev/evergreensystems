import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

import { getTimestamp, getDuration, debugServerTiming, debugQuery } from "@/lib/debug-performance";

export async function GET(request: Request) {
  const requestStartTime = getTimestamp();
  
  try {
    // Check authentication first using regular client
    const authStartTime = getTimestamp();
    const authClient = await createClient();
    const { data: { user } } = await authClient.auth.getUser();
    const authDuration = getDuration(authStartTime);
    debugServerTiming("API /admin/sections", "Authentication", authDuration, { hasUser: !!user });

    if (!user) {
      const totalDuration = getDuration(requestStartTime);
      debugServerTiming("API /admin/sections", "Total (unauthorized)", totalDuration);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Use regular client - service role was causing connection issues
    // The indexes and query optimizations should still help performance
    const supabase = authClient;

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
      const joinQueryStartTime = getTimestamp();
      // Optimize: Removed content and media_url (large JSONB fields not needed for sidebar)
      // This should use idx_page_sections_page_id_position index
      const dbQueryStartTime = getTimestamp();
      const { data: pageSections, error: pageSectionsError } = await supabase
        .from("page_sections")
        .select(`
          id,
          section_id,
          position,
          status,
          sections (id, type, title, admin_title, header_title, subtitle, eyebrow, icon, created_at, updated_at)
        `)
        .eq("page_id", pageId)
        .order("position", { ascending: true });
      const dbQueryDuration = getDuration(dbQueryStartTime);
      
      const joinQueryDuration = getDuration(joinQueryStartTime);
      debugQuery("API /admin/sections", "Page sections join query", joinQueryDuration, {
        pageId,
        rowCount: pageSections?.length || 0,
        dbQueryTime: dbQueryDuration
      });
      
      // Log if database query is slow
      if (dbQueryDuration > 100) {
        debugServerTiming("API /admin/sections", "⚠️ SLOW DB QUERY", dbQueryDuration, {
          pageId,
          rowCount: pageSections?.length || 0,
          threshold: "100ms"
        });
      }

      if (pageSectionsError) {
        const totalDuration = getDuration(requestStartTime);
        debugServerTiming("API /admin/sections", "Total (ERROR)", totalDuration, { error: pageSectionsError.message });
        return NextResponse.json({ error: pageSectionsError.message }, { status: 500 });
      }

      const transformStartTime = getTimestamp();
      const sections = (pageSections || [])
        .filter((ps: any) => ps.sections !== null)
        .map((ps: any) => ({
          ...ps.sections,
          page_section_id: ps.id,
          position: ps.position ?? 0,
          status: ps.status || "draft",
        }));
      const transformDuration = getDuration(transformStartTime);
      debugServerTiming("API /admin/sections", "Data transformation", transformDuration, {
        sectionsCount: sections.length
      });

      const serializeStartTime = getTimestamp();
      const response = NextResponse.json(sections, {
        status: 200,
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      });
      const serializeDuration = getDuration(serializeStartTime);
      debugServerTiming("API /admin/sections", "Response serialization", serializeDuration);
      
      const totalDuration = getDuration(requestStartTime);
      debugServerTiming("API /admin/sections", "Total", totalDuration, { 
        pageId,
        sectionsCount: sections.length 
      });
      
      return response;
    }

    // Otherwise return all sections - query directly from database
    // Get all sections (user is authenticated, so RLS should allow this)
    // Optimize: Remove content and media_url for sidebar (large JSONB fields)
    const allSectionsQueryStartTime = getTimestamp();
    const { data: sections, error: sectionsError } = await supabase
      .from("sections")
      .select("id, type, title, admin_title, header_title, subtitle, eyebrow, icon, created_at, updated_at")
      .order("admin_title", { ascending: true, nullsFirst: false });
    
    const allSectionsQueryDuration = getDuration(allSectionsQueryStartTime);
    debugQuery("API /admin/sections", "All sections query", allSectionsQueryDuration, {
      rowCount: sections?.length || 0,
      hasSearch: !!search
    });

    if (sectionsError) {
      const totalDuration = getDuration(requestStartTime);
      debugServerTiming("API /admin/sections", "Total (ERROR)", totalDuration, { error: sectionsError.message });
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

    const filterStartTime = getTimestamp();
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
    const filterDuration = getDuration(filterStartTime);
    debugServerTiming("API /admin/sections", "Search filtering", filterDuration, {
      originalCount: allSections.length,
      filteredCount: filteredSections.length,
      hasSearch: !!search
    });

    console.log("🔍 [API /admin/sections] Returning filtered sections:", {
      search,
      originalCount: allSections.length,
      filteredCount: filteredSections.length,
      filteredSections: filteredSections.map((s: any) => ({ id: s.id, title: s.title || s.admin_title || s.type })),
    });

    const serializeStartTime = getTimestamp();
    const response = NextResponse.json(filteredSections, {
      status: 200,
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
    const serializeDuration = getDuration(serializeStartTime);
    debugServerTiming("API /admin/sections", "Response serialization", serializeDuration);
    
    const totalDuration = getDuration(requestStartTime);
    debugServerTiming("API /admin/sections", "Total", totalDuration, {
      sectionsCount: filteredSections.length,
      hasSearch: !!search
    });
    
    return response;
  } catch (error) {
    const totalDuration = getDuration(requestStartTime);
    debugServerTiming("API /admin/sections", "Total (ERROR)", totalDuration, {
      error: error instanceof Error ? error.message : "An unexpected error occurred"
    });
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

import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { getTimestamp, getDuration, debugServerTiming, debugQuery } from "@/lib/debug-performance";

// Force dynamic rendering to avoid compilation overhead
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Combined API endpoint for sidebar data
 * Fetches pages, sections, and site structure in a single request
 * This reduces authentication overhead and network round-trips
 */
export async function GET(request: Request) {
  const requestStartTime = getTimestamp();
  
  try {
    // Single authentication check
    const authStartTime = getTimestamp();
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const authDuration = getDuration(authStartTime);
    debugServerTiming("API /admin/sidebar-data", "Authentication", authDuration, { hasUser: !!user });

    if (!user) {
      const totalDuration = getDuration(requestStartTime);
      debugServerTiming("API /admin/sidebar-data", "Total (unauthorized)", totalDuration);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch all data in parallel - MINIMAL fields only
    const dataFetchStartTime = getTimestamp();
    
    // Run all queries in parallel using Promise.all
    const [pagesResult, pageSectionsResult] = await Promise.all([
      // 1. Fetch pages - ONLY id, title, order
      (async () => {
        const pagesQueryStartTime = getTimestamp();
        const result = await supabase
          .from("pages")
          .select("id, title, order")
          .order("order", { ascending: true });
        const pagesQueryDuration = getDuration(pagesQueryStartTime);
        debugQuery("API /admin/sidebar-data", "Pages query", pagesQueryDuration, {
          rowCount: result.data?.length || 0,
          dbQueryTime: pagesQueryDuration
        });
        return result;
      })(),
      
      // 2. Fetch page_sections - ONLY page_id, position, section_id
      (async () => {
        const pageSectionsQueryStartTime = getTimestamp();
        const result = await supabase
          .from("page_sections")
          .select("page_id, position, section_id")
          .order("page_id", { ascending: true })
          .order("position", { ascending: true });
        const pageSectionsQueryDuration = getDuration(pageSectionsQueryStartTime);
        debugQuery("API /admin/sidebar-data", "Page sections query", pageSectionsQueryDuration, {
          rowCount: result.data?.length || 0,
          dbQueryTime: pageSectionsQueryDuration
        });
        return result;
      })()
    ]);

    const { data: pages, error: pagesError } = pagesResult;
    const { data: pageSections, error: sectionsError } = pageSectionsResult;

    if (pagesError) {
      debugServerTiming("API /admin/sidebar-data", "Pages query (ERROR)", 0, { error: pagesError.message });
      return NextResponse.json({ error: pagesError.message }, { status: 500 });
    }

    if (sectionsError) {
      debugServerTiming("API /admin/sidebar-data", "Page sections query (ERROR)", 0, { error: sectionsError.message });
      return NextResponse.json({ error: sectionsError.message }, { status: 500 });
    }

    // Type definitions
    type PageSection = { page_id: string; position: number; section_id: string };
    type Section = { id: string; title: string | null; admin_title: string | null; type: string };

    // 3. Fetch sections data separately (after we have section IDs)
    const sectionIds = (pageSections as PageSection[] | null)?.map(ps => ps.section_id).filter(Boolean) || [];
      let sectionsMap = new Map<string, { id: string; title: string | null; admin_title: string | null; type: string }>();
    
    if (sectionIds.length > 0) {
      const sectionsQueryStartTime = getTimestamp();
      const { data: sections, error: sectionsDataError } = await supabase
        .from("sections")
        .select("id, title, admin_title, type")
        .in("id", sectionIds);
      const sectionsQueryDuration = getDuration(sectionsQueryStartTime);
      debugQuery("API /admin/sidebar-data", "Sections data query", sectionsQueryDuration, {
        rowCount: sections?.length || 0,
        dbQueryTime: sectionsQueryDuration
      });
      
      if (sectionsDataError) {
        debugServerTiming("API /admin/sidebar-data", "Sections data query (ERROR)", sectionsQueryDuration, { error: sectionsDataError.message });
      } else if (sections) {
        (sections as Section[]).forEach(s => {
          sectionsMap.set(s.id, { id: s.id, title: s.title, admin_title: s.admin_title, type: s.type });
        });
      }
    }

    // 3. Skip site structure - not needed for sidebar navigation
    // (Only needed when editing sections, not for displaying the sidebar)

    const dataFetchDuration = getDuration(dataFetchStartTime);
    debugServerTiming("API /admin/sidebar-data", "Data fetch (parallel)", dataFetchDuration, {
      pagesCount: pages?.length || 0,
      sectionsCount: pageSections?.length || 0
    });

    // Transform sections data to group by page - minimal data only
    const transformStartTime = getTimestamp();
    const sectionsByPage = new Map<string, Array<{ id: string; title: string | null; admin_title: string | null; type: string; position: number }>>();
    
    if (pageSections) {
      for (const pageSection of pageSections as PageSection[]) {
        const pageId = pageSection.page_id;
        const sectionId = pageSection.section_id;
        const section = sectionsMap.get(sectionId);
        
        if (section) {
          if (!sectionsByPage.has(pageId)) {
            sectionsByPage.set(pageId, []);
          }
          sectionsByPage.get(pageId)!.push({
            id: section.id,
            title: section.title,
            admin_title: section.admin_title,
            type: section.type,
            position: pageSection.position
          });
        }
      }
    }

    const transformDuration = getDuration(transformStartTime);
    debugServerTiming("API /admin/sidebar-data", "Data transformation", transformDuration);

    // Build response - minimal data only
    const responseData = {
      pages: pages || [],
      sectionsByPage: Object.fromEntries(sectionsByPage)
    };

    // Log response size before serialization
    const responseSize = JSON.stringify(responseData).length;
    debugServerTiming("API /admin/sidebar-data", "Response size (bytes)", 0, { 
      size: responseSize,
      pagesCount: pages?.length || 0,
      sectionsCount: Object.values(sectionsByPage).reduce((sum, arr) => sum + arr.length, 0)
    });

    const serializeStartTime = getTimestamp();
    const response = NextResponse.json(responseData, {
      status: 200,
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
    const serializeDuration = getDuration(serializeStartTime);
    debugServerTiming("API /admin/sidebar-data", "Response serialization", serializeDuration, { responseSize });
    
    const totalDuration = getDuration(requestStartTime);
    debugServerTiming("API /admin/sidebar-data", "Total", totalDuration, {
      pagesCount: pages?.length || 0,
      sectionsCount: pageSections?.length || 0
    });
    
    return response;
  } catch (error) {
    const totalDuration = getDuration(requestStartTime);
    debugServerTiming("API /admin/sidebar-data", "Total (ERROR)", totalDuration, {
      error: error instanceof Error ? error.message : "An unexpected error occurred"
    });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unexpected error occurred" },
      { status: 500 }
    );
  }
}


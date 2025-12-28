import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
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
  console.log("[API /admin/sidebar-data] Request received at", new Date().toISOString());
  
  try {
    // Single authentication check
    const authStartTime = getTimestamp();
    console.log("[API /admin/sidebar-data] Creating Supabase client...");
    const supabase = await createClient();
    console.log("[API /admin/sidebar-data] Checking authentication...");
    const { data: { user } } = await supabase.auth.getUser();
    const authDuration = getDuration(authStartTime);
    console.log("[API /admin/sidebar-data] Authentication completed in", authDuration, "ms");
    debugServerTiming("API /admin/sidebar-data", "Authentication", authDuration, { hasUser: !!user });

    if (!user) {
      const totalDuration = getDuration(requestStartTime);
      debugServerTiming("API /admin/sidebar-data", "Total (unauthorized)", totalDuration);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Use service role client to bypass RLS for faster queries
    // Safe because middleware already authenticated the user
    const adminSupabase = createServiceRoleClient();
    console.log("[API /admin/sidebar-data] Using service role client to bypass RLS");

    // Fetch all data in parallel - MINIMAL fields only
    // Optimized: Use JOIN to fetch page_sections with sections in one query
    const dataFetchStartTime = getTimestamp();
    console.log("[API /admin/sidebar-data] Starting parallel queries...");
    
    // Run queries in parallel
    const [pagesResult, pageSectionsWithSectionsResult] = await Promise.all([
      // 1. Fetch pages - ONLY id, title, order
      (async () => {
        const pagesQueryStartTime = getTimestamp();
        console.log("[API /admin/sidebar-data] Executing pages query...");
        const result = await adminSupabase
          .from("pages")
          .select("id, title, order")
          .order("order", { ascending: true });
        const pagesQueryDuration = getDuration(pagesQueryStartTime);
        console.log("[API /admin/sidebar-data] Pages query completed in", pagesQueryDuration, "ms, rows:", result.data?.length || 0);
        debugQuery("API /admin/sidebar-data", "Pages query", pagesQueryDuration, {
          rowCount: result.data?.length || 0,
          dbQueryTime: pagesQueryDuration
        });
        return result;
      })(),
      
      // 2. Fetch page_sections with sections data in one JOIN query
      // This eliminates the need for a separate sections query
      // Note: Admin sidebar shows ALL sections (published, draft, deactivated) for management
      (async () => {
        const pageSectionsQueryStartTime = getTimestamp();
        console.log("[API /admin/sidebar-data] Executing page_sections JOIN query...");
        const result = await adminSupabase
          .from("page_sections")
          .select(`
            page_id,
            position,
            section_id,
            sections (
              id,
              title,
              admin_title,
              type
            )
          `)
          .order("page_id", { ascending: true })
          .order("position", { ascending: true });
        const pageSectionsQueryDuration = getDuration(pageSectionsQueryStartTime);
        console.log("[API /admin/sidebar-data] Page sections JOIN query completed in", pageSectionsQueryDuration, "ms, rows:", result.data?.length || 0);
        debugQuery("API /admin/sidebar-data", "Page sections with sections JOIN query", pageSectionsQueryDuration, {
          rowCount: result.data?.length || 0,
          dbQueryTime: pageSectionsQueryDuration
        });
        return result;
      })()
    ]);

    const { data: pages, error: pagesError } = pagesResult;
    const { data: pageSectionsWithSections, error: sectionsError } = pageSectionsWithSectionsResult;

    if (pagesError) {
      debugServerTiming("API /admin/sidebar-data", "Pages query (ERROR)", 0, { error: pagesError.message });
      return NextResponse.json({ error: pagesError.message }, { status: 500 });
    }

    if (sectionsError) {
      debugServerTiming("API /admin/sidebar-data", "Page sections query (ERROR)", 0, { error: sectionsError.message });
      return NextResponse.json({ error: sectionsError.message }, { status: 500 });
    }

    // Type definitions
    type PageSectionWithSection = { 
      page_id: string; 
      position: number; 
      section_id: string;
      sections: { id: string; title: string | null; admin_title: string | null; type: string } | null;
    };

    // 3. Skip site structure - not needed for sidebar navigation
    // (Only needed when editing sections, not for displaying the sidebar)

    const dataFetchDuration = getDuration(dataFetchStartTime);
    console.log("[API /admin/sidebar-data] Parallel queries completed in", dataFetchDuration, "ms");
    debugServerTiming("API /admin/sidebar-data", "Data fetch (parallel)", dataFetchDuration, {
      pagesCount: pages?.length || 0,
      sectionsCount: pageSectionsWithSections?.length || 0
    });

    // Transform sections data to group by page - minimal data only
    // Since we used JOIN, sections data is already included
    const transformStartTime = getTimestamp();
    console.log("[API /admin/sidebar-data] Transforming data...");
    const sectionsByPage = new Map<string, Array<{ id: string; title: string | null; admin_title: string | null; type: string; position: number }>>();
    
    if (pageSectionsWithSections) {
      for (const pageSection of pageSectionsWithSections as PageSectionWithSection[]) {
        const pageId = pageSection.page_id;
        const section = pageSection.sections;
        
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
    console.log("[API /admin/sidebar-data] Serializing response...");
    const response = NextResponse.json(responseData, {
      status: 200,
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
    const serializeDuration = getDuration(serializeStartTime);
    console.log("[API /admin/sidebar-data] Response serialized in", serializeDuration, "ms");
    debugServerTiming("API /admin/sidebar-data", "Response serialization", serializeDuration, { responseSize });
    
    const totalDuration = getDuration(requestStartTime);
    console.log("[API /admin/sidebar-data] Total request time:", totalDuration, "ms");
    debugServerTiming("API /admin/sidebar-data", "Total", totalDuration, {
      pagesCount: pages?.length || 0,
      sectionsCount: pageSectionsWithSections?.length || 0
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


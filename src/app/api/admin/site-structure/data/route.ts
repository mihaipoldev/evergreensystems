import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { getTimestamp, getDuration, debugServerTiming, debugQuery } from "@/lib/debug-performance";

export async function GET(request: Request) {
  const requestStartTime = getTimestamp();
  
  try {
    // Check authentication
    const authStartTime = getTimestamp();
    const authClient = await createClient();
    const { data: { user } } = await authClient.auth.getUser();
    const authDuration = getDuration(authStartTime);
    debugServerTiming("API /admin/site-structure/data", "Authentication", authDuration, { hasUser: !!user });

    if (!user) {
      const totalDuration = getDuration(requestStartTime);
      debugServerTiming("API /admin/site-structure/data", "Total (unauthorized)", totalDuration);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = authClient;

    // Step 1: Fetch all site structure entries
    const siteStructureQueryStartTime = getTimestamp();
    const { data: allSiteStructure, error: siteStructureError } = await supabase
      .from("site_structure")
      .select("*")
      .order("page_type", { ascending: true });
    
    const siteStructureQueryDuration = getDuration(siteStructureQueryStartTime);
    debugQuery("API /admin/site-structure/data", "Site structure query", siteStructureQueryDuration, {
      rowCount: allSiteStructure?.length || 0
    });

    if (siteStructureError) {
      const totalDuration = getDuration(requestStartTime);
      debugServerTiming("API /admin/site-structure/data", "Total (ERROR)", totalDuration, { error: siteStructureError.message });
      return NextResponse.json({ error: siteStructureError.message }, { status: 500 });
    }

    // Step 1b: Fetch all page IDs that are referenced in site structure (optimize: single query)
    const pageIds = new Set<string>();
    (allSiteStructure || []).forEach((entry: any) => {
      if (entry.production_page_id) pageIds.add(entry.production_page_id);
      if (entry.development_page_id) pageIds.add(entry.development_page_id);
    });

    // Fetch referenced pages in a single query (instead of N+1)
    let referencedPages: Record<string, { id: string; title: string }> = {};
    if (pageIds.size > 0) {
      const referencedPagesQueryStartTime = getTimestamp();
      const { data: pagesData, error: pagesDataError } = await supabase
        .from("pages")
        .select("id, title")
        .in("id", Array.from(pageIds));
      
      const referencedPagesQueryDuration = getDuration(referencedPagesQueryStartTime);
      debugQuery("API /admin/site-structure/data", "Referenced pages query", referencedPagesQueryDuration, {
        rowCount: pagesData?.length || 0
      });

      if (!pagesDataError && pagesData) {
        pagesData.forEach((page: { id: string; title: string }) => {
          referencedPages[page.id] = { id: page.id, title: page.title };
        });
      }
    }

    // Step 2: Fetch all pages grouped by type (only id, title, type - minimal fields)
    const pagesQueryStartTime = getTimestamp();
    const { data: allPages, error: pagesError } = await supabase
      .from("pages")
      .select("id, title, type")
      .not("type", "is", null)
      .order("order", { ascending: true })
      .order("created_at", { ascending: false });
    
    const pagesQueryDuration = getDuration(pagesQueryStartTime);
    debugQuery("API /admin/site-structure/data", "Pages query", pagesQueryDuration, {
      rowCount: allPages?.length || 0
    });

    if (pagesError) {
      const totalDuration = getDuration(requestStartTime);
      debugServerTiming("API /admin/site-structure/data", "Total (ERROR)", totalDuration, { error: pagesError.message });
      return NextResponse.json({ error: pagesError.message }, { status: 500 });
    }

    // Step 3: Process and group pages by type on server (not client)
    const processStartTime = getTimestamp();
    
    // Transform site structure to match expected format using referenced pages
    const siteStructureWithPages = (allSiteStructure || []).map((entry: any) => ({
      ...entry,
      production_page: entry.production_page_id && referencedPages[entry.production_page_id]
        ? referencedPages[entry.production_page_id]
        : null,
      development_page: entry.development_page_id && referencedPages[entry.development_page_id]
        ? referencedPages[entry.development_page_id]
        : null,
    }));

    // Group pages by type (server-side)
    const pagesByType: Record<string, Array<{ id: string; title: string }>> = {};
    (allPages || []).forEach((page: { id: string; title: string; type: string | null }) => {
      if (page.type) {
        if (!pagesByType[page.type]) {
          pagesByType[page.type] = [];
        }
        pagesByType[page.type].push({
          id: page.id,
          title: page.title,
        });
      }
    });

    // Sort pages within each type (already sorted by order, created_at from query)
    Object.keys(pagesByType).forEach((type) => {
      // Pages are already sorted by the query, but we can ensure consistency
      pagesByType[type] = pagesByType[type];
    });

    const processDuration = getDuration(processStartTime);
    debugServerTiming("API /admin/site-structure/data", "Data processing", processDuration, {
      siteStructureCount: siteStructureWithPages.length,
      pageTypesCount: Object.keys(pagesByType).length,
    });

    const serializeStartTime = getTimestamp();
    const response = NextResponse.json({
      siteStructure: siteStructureWithPages,
      pagesByType: pagesByType,
    }, { status: 200 });
    
    const serializeDuration = getDuration(serializeStartTime);
    debugServerTiming("API /admin/site-structure/data", "Response serialization", serializeDuration);
    
    const totalDuration = getDuration(requestStartTime);
    debugServerTiming("API /admin/site-structure/data", "Total", totalDuration, {
      siteStructureCount: siteStructureWithPages.length,
      pageTypesCount: Object.keys(pagesByType).length,
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unexpected error occurred" },
      { status: 500 }
    );
  }
}


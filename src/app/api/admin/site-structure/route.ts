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
    debugServerTiming("API /admin/site-structure", "Authentication", authDuration, { hasUser: !!user });

    if (!user) {
      const totalDuration = getDuration(requestStartTime);
      debugServerTiming("API /admin/site-structure", "Total (unauthorized)", totalDuration);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Use regular client - service role was causing connection issues
    // The indexes and query optimizations should still help performance
    const supabase = authClient;

    const { searchParams } = new URL(request.url);
    const pageId = searchParams.get("pageId");

    // If pageId is provided, return entries for that specific page
    if (pageId) {
      // OPTIMIZE: Single query with OR condition instead of two separate queries
      // This uses indexes on production_page_id and development_page_id
      const dbQueryStartTime = getTimestamp();
      const { data: allData, error: queryError } = await supabase
        .from("site_structure")
        .select("page_type, production_page_id, development_page_id")
        .or(`production_page_id.eq.${pageId},development_page_id.eq.${pageId}`);
      
      const dbQueryDuration = getDuration(dbQueryStartTime);
      debugQuery("API /admin/site-structure", "Site structure query", dbQueryDuration, {
        pageId,
        rowCount: allData?.length || 0
      });
      
      if (dbQueryDuration > 100) {
        debugServerTiming("API /admin/site-structure", "⚠️ SLOW DB QUERY", dbQueryDuration, {
          pageId,
          threshold: "100ms"
        });
      }

      if (queryError) {
        const totalDuration = getDuration(requestStartTime);
        debugServerTiming("API /admin/site-structure", "Total (ERROR)", totalDuration, { error: queryError.message });
        return NextResponse.json({ error: queryError.message }, { status: 500 });
      }

      // Process single query result
      const processStartTime = getTimestamp();
      type SiteStructureEntry = {
        page_type: string;
        production_page_id: string | null;
        development_page_id: string | null;
      };
      
      const entries: SiteStructureEntry[] = (allData || []) as SiteStructureEntry[];
      
      const result = entries.map(entry => {
        const isProduction = entry.production_page_id === pageId;
        const isDevelopment = entry.development_page_id === pageId;
        
        let environment: 'production' | 'development' | 'both';
        if (isProduction && isDevelopment) {
          environment = 'both';
        } else if (isProduction) {
          environment = 'production';
        } else {
          environment = 'development';
        }

        return {
          page_type: entry.page_type,
          environment,
        };
      });
      
      const processDuration = getDuration(processStartTime);
      debugServerTiming("API /admin/site-structure", "Data processing", processDuration, {
        resultCount: result.length
      });

      const serializeStartTime = getTimestamp();
      const response = NextResponse.json(result, { status: 200 });
      const serializeDuration = getDuration(serializeStartTime);
      debugServerTiming("API /admin/site-structure", "Response serialization", serializeDuration);
      
      const totalDuration = getDuration(requestStartTime);
      debugServerTiming("API /admin/site-structure", "Total", totalDuration, {
        pageId,
        resultCount: result.length
      });

      return response;
    }

    // If no pageId, return all site structure entries with page information
    const dbQueryStartTime = getTimestamp();
    const { data: allSiteStructure, error: queryError } = await supabase
      .from("site_structure")
      .select("*")
      .order("page_type", { ascending: true });
    
    const dbQueryDuration = getDuration(dbQueryStartTime);
    debugQuery("API /admin/site-structure", "All site structure query", dbQueryDuration, {
      rowCount: allSiteStructure?.length || 0
    });

    if (queryError) {
      const totalDuration = getDuration(requestStartTime);
      debugServerTiming("API /admin/site-structure", "Total (ERROR)", totalDuration, { error: queryError.message });
      return NextResponse.json({ error: queryError.message }, { status: 500 });
    }

    // Fetch production and development pages for each site structure entry
    const processStartTime = getTimestamp();
    const siteStructureWithPages = await Promise.all(
      (allSiteStructure || []).map(async (entry: any) => {
        // Fetch production page
        const productionPage = entry.production_page_id
          ? await supabase
              .from("pages")
              .select("id, title")
              .eq("id", entry.production_page_id)
              .maybeSingle()
          : { data: null };

        // Fetch development page
        const developmentPage = entry.development_page_id
          ? await supabase
              .from("pages")
              .select("id, title")
              .eq("id", entry.development_page_id)
              .maybeSingle()
          : { data: null };

        return {
          ...entry,
          production_page: productionPage.data || null,
          development_page: developmentPage.data || null,
        };
      })
    );
    
    const processDuration = getDuration(processStartTime);
    debugServerTiming("API /admin/site-structure", "Data processing", processDuration, {
      resultCount: siteStructureWithPages.length
    });

    const serializeStartTime = getTimestamp();
    const response = NextResponse.json(siteStructureWithPages, { status: 200 });
    const serializeDuration = getDuration(serializeStartTime);
    debugServerTiming("API /admin/site-structure", "Response serialization", serializeDuration);
    
    const totalDuration = getDuration(requestStartTime);
    debugServerTiming("API /admin/site-structure", "Total", totalDuration, {
      resultCount: siteStructureWithPages.length
    });

    return response;
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

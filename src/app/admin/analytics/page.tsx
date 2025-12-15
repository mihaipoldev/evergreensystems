import { Suspense } from "react";
import { unstable_noStore as noStore } from "next/cache";
import { AdminPageTitle } from "@/components/admin/AdminPageTitle";
import { AnalyticsDashboard } from "@/components/admin/AnalyticsDashboard";
import { AnalyticsDebugInfo } from "@/components/admin/AnalyticsDebugInfo";
import { DashboardTimeScope } from "@/components/admin/DashboardTimeScope";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

// Force dynamic rendering to ensure fresh data - prevent ALL caching
export const dynamic = 'force-dynamic';
export const revalidate = 0; // Never cache
export const fetchCache = 'force-no-store'; // Disable fetch caching
export const runtime = 'nodejs'; // Ensure server-side rendering
export const dynamicParams = true; // Allow dynamic params

type AnalyticsPageProps = {
  searchParams: Promise<{ scope?: string }>;
};

type DailyPoint = { date: string; count: number };
type AnalyticsEvent = Database["public"]["Tables"]["analytics_events"]["Row"];

type AnalyticsData = {
  totalPageViews: number;
  totalCTAClicks: number;
  totalVideoClicks: number;
  totalFAQClicks: number;
  totalSessionStarts: number;
  uniqueSessions: number;
  pageViewsSeries: DailyPoint[];
  ctaClicksSeries: DailyPoint[];
  sessionStartsSeries: DailyPoint[];
  videoClicksSeries: DailyPoint[];
  faqClicksSeries: DailyPoint[];
  topCTAsSplitted: Array<{ id: string; label: string; clicks: number; location: string }>;
  topCTAsAggregated: Array<{ id: string; label: string; clicks: number }>;
  topFAQs: Array<{ id: string; question: string; clicks: number }>;
  topLocations: Array<{ location: string; clicks: number }>;
  topCountries: Array<{ country: string; count: number }>;
  topCountriesBySessionStart: Array<{ country: string; count: number }>;
  topCountriesByPageView: Array<{ country: string; count: number }>;
  topCountriesByCTAClick: Array<{ country: string; count: number }>;
  topCountriesByVideoClick: Array<{ country: string; count: number }>;
  topCountriesByFAQClick: Array<{ country: string; count: number }>;
};

async function AnalyticsContent({ scope }: { scope: string }) {
  // Prevent Next.js from caching this route - always fetch fresh data
  // Call noStore() multiple times to ensure it's not optimized away
  noStore();
  noStore();
  
  // Use service role client for admin analytics to bypass RLS issues
  // This is safe because middleware already protects the route
  const supabase = createServiceRoleClient();
  
  // Calculate date range based on scope
  // Validate and parse scope properly
  let lookbackDays: number;
  if (scope === "all") {
    lookbackDays = 0; // 0 means fetch all
  } else {
    const parsed = parseInt(scope, 10);
    // Validate parsed value - if invalid, default to 30
    lookbackDays = isNaN(parsed) || parsed <= 0 ? 30 : parsed;
  }

  // Use current time to ensure we always get the latest data
  const now = new Date();
  const lookbackDate = scope === "all" || lookbackDays === 0 
    ? null 
    : new Date(now.getTime() - lookbackDays * 24 * 60 * 60 * 1000);
  
  // Log scope calculation for debugging
  console.log('[AnalyticsContent] Scope calculation:', {
    inputScope: scope,
    lookbackDays,
    lookbackDate: lookbackDate?.toISOString(),
    now: now.toISOString(),
    daysAgo: lookbackDays,
  });
  
  // Force fresh query by adding a small random factor to prevent any caching
  // This ensures the query is always unique
  const cacheBuster = Date.now();

  // For "all" scope, fetch ALL events without any date filter
  // For other scopes, fetch with a safety buffer to ensure we don't miss events due to timezone issues
  // CRITICAL: Supabase has a default limit of 1000 rows - we MUST set a higher limit!
  let query = supabase
    .from("analytics_events")
    .select("*", { count: 'exact' }) // Get count for debugging
    .order("created_at", { ascending: false });
  
  // Only add date filter if NOT "all" scope
  if (scope !== "all" && lookbackDays > 0) {
    // Add safety buffer (extra 2 days) to ensure we don't miss events due to timezone issues
    // But don't make it too large or we'll fetch unnecessary data
    const safetyDays = lookbackDays + 2;
    const safetyDate = new Date(now.getTime() - safetyDays * 24 * 60 * 60 * 1000);
    const safetyISO = safetyDate.toISOString();
    query = query.gte("created_at", safetyISO);
  }
  
  // CRITICAL FIX: Supabase defaults to 1000 row limit
  // We need to fetch ALL events, so we'll use pagination to ensure we get everything
  // Use 1000 as batch size since that's Supabase's default limit - this ensures we can fetch all data
  const BATCH_SIZE = 1000;
  let allEventsRaw: AnalyticsEvent[] = [];
  let hasMore = true;
  let offset = 0;
  let totalFetched = 0;
  let eventsError: any = null;
  let count: number | null = null;
  
  // Fetch events in batches to ensure we get ALL events
  // CRITICAL: Supabase has a default limit of 1000 rows, so we MUST paginate
  let batchNumber = 0;
  while (hasMore) {
    batchNumber++;
    // Rebuild the query for each batch
    let batchQuery = supabase
      .from("analytics_events")
      .select("*", { count: offset === 0 ? 'exact' : 'estimated' }) // Only count on first batch
      .order("created_at", { ascending: false });
    
    // Apply the same date filter if needed
    if (scope !== "all" && lookbackDays > 0) {
      const safetyDays = lookbackDays + 2;
      const safetyDate = new Date(now.getTime() - safetyDays * 24 * 60 * 60 * 1000);
      const safetyISO = safetyDate.toISOString();
      batchQuery = batchQuery.gte("created_at", safetyISO);
    }
    
    // CRITICAL: Use range() to paginate - this should override Supabase's default 1000 limit
    // Note: range() is inclusive on both ends, so range(0, 9999) fetches 10000 rows
    batchQuery = batchQuery.range(offset, offset + BATCH_SIZE - 1);
    
    console.log(`[Analytics] Fetching batch ${batchNumber}: offset=${offset}, limit=${BATCH_SIZE}`);
    
    const { data: batchData, error: batchError, count: batchCount } = await batchQuery as { 
      data: AnalyticsEvent[] | null; 
      error: any;
      count: number | null;
    };
    
    if (batchError) {
      console.error(`[Analytics] Error fetching batch ${batchNumber}:`, batchError);
      eventsError = batchError;
      break;
    }
    
    // Get count from first batch
    if (offset === 0 && batchCount !== null) {
      count = batchCount;
      console.log(`[Analytics] Total events in database (estimated): ${batchCount}`);
    }
    
    const batchLength = batchData?.length || 0;
    console.log(`[Analytics] Batch ${batchNumber}: fetched ${batchLength} events (total so far: ${totalFetched + batchLength})`);
    
    if (batchData && batchLength > 0) {
      allEventsRaw = [...allEventsRaw, ...batchData];
      totalFetched += batchLength;
      
      // If we got a full batch (BATCH_SIZE events), there might be more data
      // Only stop if we got fewer than BATCH_SIZE events (meaning we've reached the actual end)
      if (batchLength === BATCH_SIZE) {
        // Got full batch - there might be more
        hasMore = true;
        offset += BATCH_SIZE;
        console.log(`[Analytics] Batch ${batchNumber} complete (${batchLength} events). Fetching next batch...`);
      } else {
        // Got fewer than requested - we've reached the end
        hasMore = false;
        console.log(`[Analytics] Reached end of data. Batch ${batchNumber} returned ${batchLength} events (less than ${BATCH_SIZE})`);
      }
    } else {
      hasMore = false;
      console.log(`[Analytics] No more events. Batch ${batchNumber} returned 0 events`);
    }
    
    // Safety check: if we've fetched a lot, log it
    if (totalFetched >= 10000 && totalFetched % 10000 === 0) {
      console.log(`[Analytics] Progress: Fetched ${totalFetched} events so far...`);
    }
    
    // Safety limit to prevent infinite loops
    if (batchNumber > 100) {
      console.warn(`[Analytics] WARNING: Stopped after ${batchNumber} batches to prevent infinite loop`);
      break;
    }
  }
  
  console.log(`[Analytics] Total events fetched: ${totalFetched} (in ${Math.ceil(totalFetched / BATCH_SIZE) || 1} batches)`);
  
  // Log if we might have hit a practical limit
  if (totalFetched >= 50000) {
    console.warn('[Analytics] WARNING: Fetched 50k+ events. Consider optimizing query or adding date filters.');
  }
  
  // Also get direct counts from database for comparison
  let directPageViewCount: number | null = null;
  let directTotalCount: number | null = null;
  try {
    // Get total page views count directly from DB
    let pageViewCountQuery = supabase
      .from("analytics_events")
      .select("*", { count: 'exact', head: true })
      .eq("event_type", "page_view");
    
    if (scope !== "all" && lookbackDays > 0) {
      const safetyDays = lookbackDays + 2;
      const safetyDate = new Date(now.getTime() - safetyDays * 24 * 60 * 60 * 1000);
      const safetyISO = safetyDate.toISOString();
      pageViewCountQuery = pageViewCountQuery.gte("created_at", safetyISO);
    }
    
    const { count: pvCount } = await pageViewCountQuery as { count: number | null };
    directPageViewCount = pvCount;
    
    // Get total events count
    let totalCountQuery = supabase
      .from("analytics_events")
      .select("*", { count: 'exact', head: true });
    
    if (scope !== "all" && lookbackDays > 0) {
      const safetyDays = lookbackDays + 2;
      const safetyDate = new Date(now.getTime() - safetyDays * 24 * 60 * 60 * 1000);
      const safetyISO = safetyDate.toISOString();
      totalCountQuery = totalCountQuery.gte("created_at", safetyISO);
    }
    
    const { count: totalCount } = await totalCountQuery as { count: number | null };
    directTotalCount = totalCount;
  } catch (e) {
    console.warn('[Analytics] Failed to get direct counts:', e);
  }
  
  // Filter events by date in JavaScript for precise date comparison
  // If scope is "all", don't filter - use all events
  const finalEvents = scope === "all" || lookbackDays === 0
    ? allEventsRaw
    : allEventsRaw.filter((e) => {
        const eventDate = new Date(e.created_at);
        const isInRange = eventDate >= lookbackDate!;
        return isInRange;
      });
  
  // Debug: Log total events fetched vs expected (after finalEvents is defined)
  const pageViewsInRaw = allEventsRaw.filter((e) => e.event_type === "page_view").length;
  console.log('[Analytics] Query results:', {
    scope,
    lookbackDays,
    totalEventsFetched: allEventsRaw.length,
    databaseTotalCount: directTotalCount,
    databasePageViewCount: directPageViewCount,
    queryCount: count,
    pageViewsInRaw,
    pageViewsAfterFilter: finalEvents.filter((e) => e.event_type === "page_view").length,
    ctaClicksInRaw: allEventsRaw.filter((e) => e.event_type === "link_click" && e.entity_type === "cta_button").length,
    queryHadDateFilter: scope !== "all" && lookbackDays > 0,
    mightBeMissingPageViews: directPageViewCount !== null && pageViewsInRaw < directPageViewCount,
    missingPageViews: directPageViewCount !== null ? directPageViewCount - pageViewsInRaw : null,
  });
  
  // Debug: Check date filtering
  if (scope !== "all" && lookbackDays > 0 && allEventsRaw.length > 0) {
    const sampleEvents = allEventsRaw.slice(0, 10);
    const filteredSample = finalEvents.slice(0, 10);
    console.log('[Analytics] Date filtering check:', {
      lookbackDate: lookbackDate?.toISOString(),
      lookbackDays,
      totalFetched: allEventsRaw.length,
      totalFiltered: finalEvents.length,
      sampleFetchedDates: sampleEvents.map(e => e.created_at),
      sampleFilteredDates: filteredSample.map(e => e.created_at),
      oldestFetched: allEventsRaw[allEventsRaw.length - 1]?.created_at,
      oldestFiltered: finalEvents.length > 0 ? finalEvents[finalEvents.length - 1]?.created_at : 'none',
    });
  }

  // Debug logging - always log to help diagnose caching issues
  console.log('[Analytics] Main page query:', {
    timestamp: new Date().toISOString(),
    cacheBuster,
    scope,
    lookbackDays: scope === "all" ? "all" : lookbackDays,
    lookbackDate: scope === "all" ? "all events" : lookbackDate?.toISOString(),
    lookbackDateJS: scope === "all" ? "all events" : lookbackDate?.toISOString(),
    now: now.toISOString(),
    totalEventsFetched: allEventsRaw.length,
    eventsAfterDateFilter: finalEvents.length,
    pageViews: finalEvents.filter((e) => e.event_type === "page_view").length,
    ctaClicks: finalEvents.filter((e) => e.event_type === "link_click" && e.entity_type === "cta_button").length,
    newestEvent: allEventsRaw[0]?.created_at,
    oldestEventInRange: finalEvents.length > 0 ? finalEvents[finalEvents.length - 1]?.created_at : "none",
    sampleEventDates: finalEvents.slice(0, 5).map(e => ({ date: e.created_at, type: e.event_type })),
    queryTime: now.toISOString(),
  });

  let data: AnalyticsData;

  // Log errors for debugging
  if (eventsError) {
    console.error('[Analytics] Error fetching events:', eventsError);
  }

  if (eventsError || !finalEvents || finalEvents.length === 0) {
    data = {
      totalPageViews: 0,
      totalCTAClicks: 0,
      totalVideoClicks: 0,
      totalFAQClicks: 0,
      totalSessionStarts: 0,
      uniqueSessions: 0,
      pageViewsSeries: [],
      ctaClicksSeries: [],
      sessionStartsSeries: [],
      videoClicksSeries: [],
      faqClicksSeries: [],
      topCTAsSplitted: [],
      topCTAsAggregated: [],
      topFAQs: [],
      topLocations: [],
      topCountries: [],
      topCountriesBySessionStart: [],
      topCountriesByPageView: [],
      topCountriesByCTAClick: [],
      topCountriesByVideoClick: [],
      topCountriesByFAQClick: [],
    };
  } else {
    // Use the same logic as the API route (copy from getAnalyticsData)
    // Get CTA buttons for enrichment
    const { data: ctaButtons } = await supabase
      .from("cta_buttons")
      .select("id, label") as { data: Array<{ id: string; label: string }> | null };

    const ctaButtonMap = new Map((ctaButtons || []).map((btn) => [btn.id, btn.label]));

    // Get FAQ items for enrichment
    const { data: faqItems } = await supabase
      .from("faq_items")
      .select("id, question") as { data: Array<{ id: string; question: string }> | null };

    const faqItemMap = new Map((faqItems || []).map((item) => [item.id, item.question]));

    // Aggregate events by type - filter from merged events array
    const pageViews = finalEvents.filter((e) => e.event_type === "page_view");
    const ctaClicks = finalEvents.filter((e) => e.event_type === "link_click" && e.entity_type === "cta_button");
    const videoClicks = finalEvents.filter((e) => e.event_type === "link_click" && e.entity_type === "media");
    const faqClicks = finalEvents.filter((e) => e.event_type === "link_click" && e.entity_type === "faq_item");
    const sessionStarts = finalEvents.filter((e) => e.event_type === "session_start");

    const uniqueSessions = new Set(finalEvents.map((e) => e.session_id).filter((id) => id !== null)).size;

    // Daily aggregation (same as API route)
    const pageViewsByDate = new Map<string, number>();
    pageViews.forEach((e) => {
      const date = new Date(e.created_at).toISOString().split("T")[0];
      pageViewsByDate.set(date, (pageViewsByDate.get(date) || 0) + 1);
    });
    const pageViewsSeries: DailyPoint[] = Array.from(pageViewsByDate.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const ctaClicksByDate = new Map<string, number>();
    ctaClicks.forEach((e) => {
      const date = new Date(e.created_at).toISOString().split("T")[0];
      ctaClicksByDate.set(date, (ctaClicksByDate.get(date) || 0) + 1);
    });
    const ctaClicksSeries: DailyPoint[] = Array.from(ctaClicksByDate.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const sessionStartsByDate = new Map<string, number>();
    sessionStarts.forEach((e) => {
      const date = new Date(e.created_at).toISOString().split("T")[0];
      sessionStartsByDate.set(date, (sessionStartsByDate.get(date) || 0) + 1);
    });
    const sessionStartsSeries: DailyPoint[] = Array.from(sessionStartsByDate.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const videoClicksByDate = new Map<string, number>();
    videoClicks.forEach((e) => {
      const date = new Date(e.created_at).toISOString().split("T")[0];
      videoClicksByDate.set(date, (videoClicksByDate.get(date) || 0) + 1);
    });
    const videoClicksSeries: DailyPoint[] = Array.from(videoClicksByDate.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Daily aggregation for FAQ clicks
    const faqClicksByDate = new Map<string, number>();
    faqClicks.forEach((e) => {
      const date = new Date(e.created_at).toISOString().split("T")[0];
      faqClicksByDate.set(date, (faqClicksByDate.get(date) || 0) + 1);
    });
    const faqClicksSeries: DailyPoint[] = Array.from(faqClicksByDate.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Top CTAs - Splitted (by entity_id + location)
    const ctaCountsSplitted = new Map<string, { clicks: number; location: string; label: string; entityId: string }>();
    ctaClicks.forEach((e) => {
      const metadata = e.metadata as any;
      const location = metadata?.location || "unknown";
      const key = `${e.entity_id}::${location}`;
      if (!ctaCountsSplitted.has(key)) {
        ctaCountsSplitted.set(key, {
          clicks: 0,
          location,
          label: ctaButtonMap.get(e.entity_id) || e.entity_id,
          entityId: e.entity_id,
        });
      }
      const entry = ctaCountsSplitted.get(key)!;
      entry.clicks += 1;
    });
    const topCTAsSplitted = Array.from(ctaCountsSplitted.values())
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 10)
      .map((entry) => ({
        id: entry.entityId,
        label: entry.label,
        clicks: entry.clicks,
        location: entry.location,
      }));

    // Top CTAs - Aggregated (by entity_id only, summing clicks across all locations)
    const ctaCountsAggregated = new Map<string, { clicks: number; label: string; entityId: string }>();
    ctaClicks.forEach((e) => {
      const entityId = e.entity_id;
      if (!ctaCountsAggregated.has(entityId)) {
        ctaCountsAggregated.set(entityId, {
          clicks: 0,
          label: ctaButtonMap.get(entityId) || entityId,
          entityId: entityId,
        });
      }
      const entry = ctaCountsAggregated.get(entityId)!;
      entry.clicks += 1;
    });
    const topCTAsAggregated = Array.from(ctaCountsAggregated.values())
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 10)
      .map((entry) => ({
        id: entry.entityId,
        label: entry.label,
        clicks: entry.clicks,
      }));

    // Top locations
    const locationCounts = new Map<string, number>();
    ctaClicks.forEach((e) => {
      const metadata = e.metadata as any;
      const location = metadata?.location || "unknown";
      locationCounts.set(location, (locationCounts.get(location) || 0) + 1);
    });
    const topLocations = Array.from(locationCounts.entries())
      .map(([location, clicks]) => ({ location, clicks }))
      .sort((a, b) => b.clicks - a.clicks);

    // Top countries
    const countryCounts = new Map<string, number>();
    finalEvents.filter((e) => e.country !== null).forEach((e) => {
      countryCounts.set(e.country!, (countryCounts.get(e.country!) || 0) + 1);
    });
    const topCountries = Array.from(countryCounts.entries())
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);

    const countriesBySessionStart = new Map<string, number>();
    finalEvents.filter((e) => e.event_type === "session_start" && e.country !== null).forEach((e) => {
      countriesBySessionStart.set(e.country!, (countriesBySessionStart.get(e.country!) || 0) + 1);
    });
    const topCountriesBySessionStart = Array.from(countriesBySessionStart.entries())
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const countriesByPageView = new Map<string, number>();
    finalEvents.filter((e) => e.event_type === "page_view" && e.country !== null).forEach((e) => {
      countriesByPageView.set(e.country!, (countriesByPageView.get(e.country!) || 0) + 1);
    });
    const topCountriesByPageView = Array.from(countriesByPageView.entries())
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const countriesByCTAClick = new Map<string, number>();
    finalEvents.filter((e) => e.event_type === "link_click" && e.entity_type === "cta_button" && e.country !== null).forEach((e) => {
      countriesByCTAClick.set(e.country!, (countriesByCTAClick.get(e.country!) || 0) + 1);
    });
    const topCountriesByCTAClick = Array.from(countriesByCTAClick.entries())
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const countriesByVideoClick = new Map<string, number>();
    finalEvents.filter((e) => e.event_type === "link_click" && e.entity_type === "media" && e.country !== null).forEach((e) => {
      countriesByVideoClick.set(e.country!, (countriesByVideoClick.get(e.country!) || 0) + 1);
    });
    const topCountriesByVideoClick = Array.from(countriesByVideoClick.entries())
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Top FAQs
    const faqCounts = new Map<string, { clicks: number; question: string; entityId: string }>();
    faqClicks.forEach((e) => {
      const faqId = e.entity_id;
      if (!faqCounts.has(faqId)) {
        faqCounts.set(faqId, {
          clicks: 0,
          question: faqItemMap.get(faqId) || e.entity_id,
          entityId: faqId,
        });
      }
      const entry = faqCounts.get(faqId)!;
      entry.clicks += 1;
    });
    const topFAQs = Array.from(faqCounts.values())
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 10)
      .map((entry) => ({
        id: entry.entityId,
        question: entry.question,
        clicks: entry.clicks,
      }));

    // Top countries by FAQ click
    const countriesByFAQClick = new Map<string, number>();
    finalEvents.filter((e) => e.event_type === "link_click" && e.entity_type === "faq_item" && e.country !== null).forEach((e) => {
      countriesByFAQClick.set(e.country!, (countriesByFAQClick.get(e.country!) || 0) + 1);
    });
    const topCountriesByFAQClick = Array.from(countriesByFAQClick.entries())
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    data = {
      totalPageViews: pageViews.length,
      totalCTAClicks: ctaClicks.length,
      totalVideoClicks: videoClicks.length,
      totalFAQClicks: faqClicks.length,
      totalSessionStarts: sessionStarts.length,
      uniqueSessions,
      pageViewsSeries,
      ctaClicksSeries,
      sessionStartsSeries,
      videoClicksSeries,
      faqClicksSeries,
      topCTAsSplitted,
      topCTAsAggregated,
      topFAQs,
      topLocations,
      topCountries,
      topCountriesBySessionStart,
      topCountriesByPageView,
      topCountriesByCTAClick,
      topCountriesByVideoClick,
      topCountriesByFAQClick,
    };
  }

  // Prepare debug info for client component
  const debugInfo = {
    timestamp: new Date().toISOString(),
    totalEventsFetched: allEventsRaw.length,
    eventsAfterDateFilter: finalEvents.length,
    pageViews: finalEvents.filter((e) => e.event_type === "page_view").length,
    ctaClicks: finalEvents.filter((e) => e.event_type === "link_click" && e.entity_type === "cta_button").length,
  };

  // Generate a unique timestamp for this render to verify page updates
  const renderTimestamp = new Date().toISOString();
  const renderTime = new Date().toLocaleTimeString('en-US', { 
    hour12: false, 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit',
    fractionalSecondDigits: 3 
  });

  return (
    <>
      <AdminPageTitle
        title="Analytics"
        description={
          <span>
            View your site analytics and performance metrics.
            <span className="ml-2 text-xs text-muted-foreground font-mono">
              (Last updated: {renderTime})
            </span>
          </span>
        }
        rightSideContent={<DashboardTimeScope />}
      />
      <AnalyticsDashboard data={data} />
      <AnalyticsDebugInfo data={data} queryInfo={debugInfo} />
    </>
  );
}

export default async function AnalyticsPage({ searchParams }: AnalyticsPageProps) {
  const params = await searchParams;
  // Get scope from URL - default to "30" if not provided
  const scope = params.scope || "30";
  
  // Debug: Log the scope being used
  console.log('[Analytics Page] Scope from URL:', {
    rawScope: params.scope,
    finalScope: scope,
    allParams: Object.fromEntries(new URLSearchParams(params as any).entries()),
  });

  return (
    <Suspense
      fallback={
        <>
          <AdminPageTitle
            title="Analytics"
            description="View your site analytics and performance metrics."
          />
        </>
      }
    >
      <AnalyticsContent scope={scope} />
    </Suspense>
  );
}

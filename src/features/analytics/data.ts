import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

type DailyPoint = { date: string; count: number };
type AnalyticsEvent = Database["public"]["Tables"]["analytics_events"]["Row"];

export type AnalyticsData = {
  totalPageViews: number;
  totalCTAClicks: number;
  totalVideoClicks: number;
  totalSessionStarts: number;
  uniqueSessions: number;
  pageViewsSeries: DailyPoint[];
  ctaClicksSeries: DailyPoint[];
  sessionStartsSeries: DailyPoint[];
  videoClicksSeries: DailyPoint[];
  topCTAs: Array<{
    id: string;
    label: string;
    clicks: number;
    location: string;
  }>;
  topLocations: Array<{
    location: string;
    clicks: number;
  }>;
  topCountries: Array<{
    country: string;
    count: number;
  }>;
  topCountriesBySessionStart: Array<{
    country: string;
    count: number;
  }>;
  topCountriesByPageView: Array<{
    country: string;
    count: number;
  }>;
  topCountriesByCTAClick: Array<{
    country: string;
    count: number;
  }>;
  topCountriesByVideoClick: Array<{
    country: string;
    count: number;
  }>;
};

const defaultData: AnalyticsData = {
  totalPageViews: 0,
  totalCTAClicks: 0,
  totalVideoClicks: 0,
  totalSessionStarts: 0,
  uniqueSessions: 0,
  pageViewsSeries: [],
  ctaClicksSeries: [],
  sessionStartsSeries: [],
  videoClicksSeries: [],
  topCTAs: [],
  topLocations: [],
  topCountries: [],
  topCountriesBySessionStart: [],
  topCountriesByPageView: [],
  topCountriesByCTAClick: [],
  topCountriesByVideoClick: [],
};

/**
 * Get analytics data for a given time scope
 */
export async function getAnalyticsData(scope: string = "30"): Promise<AnalyticsData> {
  try {
    const supabase = await createClient();
    
    // Note: We don't check auth here because:
    // 1. Middleware already protects admin routes
    // 2. RLS policies will handle access control
    // 3. Other data functions (pages, testimonials) work the same way

    // Calculate date range based on scope
    let lookbackDays: number;
    if (scope === "all") {
      lookbackDays = 365; // "all" = 1 year
    } else {
      lookbackDays = parseInt(scope, 10); // "1", "7", "30", "90", "365"
    }

    const now = new Date();
    const lookbackDate = new Date(
      now.getTime() - lookbackDays * 24 * 60 * 60 * 1000
    );
    const lookbackISO = lookbackDate.toISOString();

    // Get all analytics events - select only needed columns
    // Note: Using select("*") to match API route behavior exactly
    const eventsQuery = supabase
      .from("analytics_events")
      .select("*")
      .gte("created_at", lookbackISO);

    const { data: events, error: eventsError } = await eventsQuery as { data: AnalyticsEvent[] | null; error: any };

    if (eventsError) {
      console.error("[Analytics] Query error:", eventsError);
      // Return default data instead of throwing to prevent page crash
      return defaultData;
    }

    console.log(`[Analytics] Query result: ${events?.length || 0} events found for scope ${scope}, lookback: ${lookbackISO}`);

    if (!events || events.length === 0) {
      console.log("[Analytics] No events found, returning default data");
      return defaultData;
    }

    // Get CTA buttons for enrichment
    const { data: ctaButtons } = await supabase
      .from("cta_buttons")
      .select("id, label") as { data: Array<{ id: string; label: string }> | null };

    const ctaButtonMap = new Map(
      (ctaButtons || []).map((btn) => [btn.id, btn.label])
    );

    // Aggregate events by type - matching API route logic
    const pageViews = events.filter((e) => e.event_type === "page_view");
    const ctaClicks = events.filter((e) => e.event_type === "link_click" && e.entity_type === "cta_button");
    const videoClicks = events.filter((e) => e.event_type === "link_click" && e.entity_type === "media");
    const sessionStarts = events.filter((e) => e.event_type === "session_start");

    // Get unique sessions - matching API route logic (all events, not just session_starts)
    const uniqueSessions = new Set(
      events.map((e) => e.session_id).filter((id) => id !== null)
    ).size;

    // Aggregate by date
    const dateMap = new Map<string, { pageViews: number; ctaClicks: number; videoClicks: number; sessionStarts: number }>();

    // Daily aggregation for page views - matching API route logic
    const pageViewsByDate = new Map<string, number>();
    pageViews.forEach((e) => {
      const date = new Date(e.created_at).toISOString().split("T")[0];
      pageViewsByDate.set(date, (pageViewsByDate.get(date) || 0) + 1);
    });

    const pageViewsSeries: DailyPoint[] = Array.from(pageViewsByDate.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Daily aggregation for CTA clicks
    const ctaClicksByDate = new Map<string, number>();
    ctaClicks.forEach((e) => {
      const date = new Date(e.created_at).toISOString().split("T")[0];
      ctaClicksByDate.set(date, (ctaClicksByDate.get(date) || 0) + 1);
    });

    const ctaClicksSeries: DailyPoint[] = Array.from(ctaClicksByDate.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Daily aggregation for session starts (website visits)
    const sessionStartsByDate = new Map<string, number>();
    sessionStarts.forEach((e) => {
      const date = new Date(e.created_at).toISOString().split("T")[0];
      sessionStartsByDate.set(date, (sessionStartsByDate.get(date) || 0) + 1);
    });

    const sessionStartsSeries: DailyPoint[] = Array.from(sessionStartsByDate.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Daily aggregation for video clicks
    const videoClicksByDate = new Map<string, number>();
    videoClicks.forEach((e) => {
      const date = new Date(e.created_at).toISOString().split("T")[0];
      videoClicksByDate.set(date, (videoClicksByDate.get(date) || 0) + 1);
    });

    const videoClicksSeries: DailyPoint[] = Array.from(videoClicksByDate.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Top CTAs with location - matching API route logic
    const ctaCounts = new Map<
      string,
      { clicks: number; location: string; label: string; entityId: string }
    >();

    ctaClicks.forEach((e) => {
      const metadata = e.metadata as any;
      const location = metadata?.location || "unknown";
      const key = `${e.entity_id}::${location}`; // Use :: as separator to avoid conflicts with UUIDs

      if (!ctaCounts.has(key)) {
        ctaCounts.set(key, {
          clicks: 0,
          location,
          label: ctaButtonMap.get(e.entity_id) || e.entity_id,
          entityId: e.entity_id,
        });
      }

      const entry = ctaCounts.get(key)!;
      entry.clicks += 1;
    });

    const topCTAs = Array.from(ctaCounts.values())
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 10)
      .map((entry) => {
        return {
          id: entry.entityId,
          label: entry.label,
          clicks: entry.clicks,
          location: entry.location,
        };
      });

    // Top locations - matching API route logic
    const locationCounts = new Map<string, number>();
    ctaClicks.forEach((e) => {
      const metadata = e.metadata as any;
      const location = metadata?.location || "unknown";
      locationCounts.set(location, (locationCounts.get(location) || 0) + 1);
    });

    const topLocations = Array.from(locationCounts.entries())
      .map(([location, clicks]) => ({ location, clicks }))
      .sort((a, b) => b.clicks - a.clicks);

    // Top countries - matching API route logic (using e.country column, not metadata)
    const countryCounts = new Map<string, number>();
    events
      .filter((e) => e.country !== null)
      .forEach((e) => {
        countryCounts.set(
          e.country!,
          (countryCounts.get(e.country!) || 0) + 1
        );
      });

    const topCountries = Array.from(countryCounts.entries())
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);

    // Top countries by metric type
    const countriesBySessionStart = new Map<string, number>();
    events
      .filter((e) => e.event_type === "session_start" && e.country !== null)
      .forEach((e) => {
        countriesBySessionStart.set(
          e.country!,
          (countriesBySessionStart.get(e.country!) || 0) + 1
        );
      });

    const topCountriesBySessionStart = Array.from(countriesBySessionStart.entries())
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const countriesByPageView = new Map<string, number>();
    events
      .filter((e) => e.event_type === "page_view" && e.country !== null)
      .forEach((e) => {
        countriesByPageView.set(
          e.country!,
          (countriesByPageView.get(e.country!) || 0) + 1
        );
      });

    const topCountriesByPageView = Array.from(countriesByPageView.entries())
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const countriesByCTAClick = new Map<string, number>();
    events
      .filter(
        (e) =>
          e.event_type === "link_click" &&
          e.entity_type === "cta_button" &&
          e.country !== null
      )
      .forEach((e) => {
        countriesByCTAClick.set(
          e.country!,
          (countriesByCTAClick.get(e.country!) || 0) + 1
        );
      });

    const topCountriesByCTAClick = Array.from(countriesByCTAClick.entries())
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const countriesByVideoClick = new Map<string, number>();
    events
      .filter(
        (e) =>
          e.event_type === "link_click" &&
          e.entity_type === "media" &&
          e.country !== null
      )
      .forEach((e) => {
        countriesByVideoClick.set(
          e.country!,
          (countriesByVideoClick.get(e.country!) || 0) + 1
        );
      });

    const topCountriesByVideoClick = Array.from(countriesByVideoClick.entries())
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalPageViews: pageViews.length,
      totalCTAClicks: ctaClicks.length,
      totalVideoClicks: videoClicks.length,
      totalSessionStarts: sessionStarts.length,
      uniqueSessions,
      pageViewsSeries,
      ctaClicksSeries,
      sessionStartsSeries,
      videoClicksSeries,
      topCTAs,
      topLocations,
      topCountries,
      topCountriesBySessionStart,
      topCountriesByPageView,
      topCountriesByCTAClick,
      topCountriesByVideoClick,
    };
  } catch (error) {
    console.error("Error fetching analytics data:", error);
    return defaultData;
  }
}

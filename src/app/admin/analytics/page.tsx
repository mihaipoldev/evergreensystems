import { Suspense } from "react";
import { AdminPageTitle } from "@/components/admin/AdminPageTitle";
import { AnalyticsDashboard } from "@/components/admin/AnalyticsDashboard";
import { DashboardTimeScope } from "@/components/admin/DashboardTimeScope";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

// Force dynamic rendering to ensure fresh data
export const dynamic = 'force-dynamic';

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
  // Use service role client for admin analytics to bypass RLS issues
  // This is safe because middleware already protects the route
  const supabase = createServiceRoleClient();
  
  // Calculate date range based on scope
  let lookbackDays: number;
  if (scope === "all") {
    lookbackDays = 365;
  } else {
    lookbackDays = parseInt(scope, 10);
  }

  const now = new Date();
  const lookbackDate = new Date(now.getTime() - lookbackDays * 24 * 60 * 60 * 1000);
  const lookbackISO = lookbackDate.toISOString();

  // Get all analytics events in one query - filter by tabs client-side
  // Use service role client to bypass RLS (middleware already protects the route)
  const { data: events, error: eventsError } = await supabase
    .from("analytics_events")
    .select("*")
    .gte("created_at", lookbackISO)
    .order("created_at", { ascending: false }) as { data: AnalyticsEvent[] | null; error: any };

  // Also get ALL FAQ events directly (no time filter) to ensure we have them
  // Then filter by time in code to catch any timezone/date comparison issues
  const { data: allFaqEvents } = await supabase
    .from("analytics_events")
    .select("*")
    .eq("entity_type", "faq_item")
    .eq("event_type", "link_click")
    .order("created_at", { ascending: false })
    .limit(1000) as { data: AnalyticsEvent[] | null };
  
  // Filter FAQ events by time in code (more reliable than SQL date comparison)
  const faqEventsInRange = (allFaqEvents || []).filter((e) => {
    const eventDate = new Date(e.created_at);
    return eventDate >= lookbackDate;
  });
  
  // Merge FAQ events into main events array if they're missing (deduplicate by id)
  let allEvents: AnalyticsEvent[] = events || [];
  if (faqEventsInRange.length > 0) {
    const eventIds = new Set(allEvents.map(e => e.id));
    const missingFaqEvents = faqEventsInRange.filter(e => !eventIds.has(e.id));
    if (missingFaqEvents.length > 0) {
      allEvents = [...allEvents, ...missingFaqEvents];
    }
  }
  
  // Use merged events array
  const finalEvents = allEvents;

  let data: AnalyticsData;

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

  return (
    <>
      <AdminPageTitle
        title="Analytics"
        description="View your site analytics and performance metrics."
        rightSideContent={<DashboardTimeScope />}
      />
      <AnalyticsDashboard data={data} />
    </>
  );
}

export default async function AnalyticsPage({ searchParams }: AnalyticsPageProps) {
  const params = await searchParams;
  const scope = params.scope || "30";

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

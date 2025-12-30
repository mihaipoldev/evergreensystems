import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { Database } from "@/lib/supabase/types";

type DailyPoint = { date: string; count: number };
type AnalyticsEvent = Database["public"]["Tables"]["analytics_events"]["Row"];

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const scope = searchParams.get("scope") || "30";
    const country = searchParams.get("country");

    // Calculate date range based on scope
    let lookbackDays: number;
    if (scope === "all") {
      lookbackDays = 365; // "all" = 1 year
    } else {
      lookbackDays = parseInt(scope, 10); // "7", "30", "90", "365"
    }

    const now = new Date();
    const lookbackDate = new Date(
      now.getTime() - lookbackDays * 24 * 60 * 60 * 1000
    );
    const lookbackISO = lookbackDate.toISOString();

    // Get all analytics events (we'll aggregate in code for flexibility)
    let eventsQuery = supabase
      .from("analytics_events")
      .select("*")
      .gte("created_at", lookbackISO);

    // Filter by country if provided
    if (country) {
      // Decode and normalize country code (handle both codes and names)
      const decodedCountry = decodeURIComponent(country);
      // If it's a full country name, we'd need a mapping, but for now assume it's a code
      // The client will handle name-to-code conversion
      const countryCode = decodedCountry.toUpperCase();
      eventsQuery = eventsQuery.eq("country", countryCode);
    }

    const { data: events, error: eventsError } = await eventsQuery as { data: AnalyticsEvent[] | null; error: any };

    if (eventsError) {
      return NextResponse.json({ error: eventsError.message }, { status: 500 });
    }

    if (!events || events.length === 0) {
      return NextResponse.json({
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
        topCities: [],
        topCitiesBySessionStart: [],
        topCitiesByPageView: [],
        topCitiesByCTAClick: [],
        topCitiesByVideoClick: [],
      });
    }

    // Get CTA buttons and FAQ items for enrichment
    const { data: ctaButtons } = await supabase
      .from("cta_buttons")
      .select("id, label") as { data: Array<{ id: string; label: string }> | null };

    const { data: faqItems } = await supabase
      .from("faq_items")
      .select("id, question") as { data: Array<{ id: string; question: string }> | null };

    const ctaButtonMap = new Map(
      (ctaButtons || []).map((btn) => [btn.id, btn.label])
    );

    const faqItemMap = new Map(
      (faqItems || []).map((item) => [item.id, item.question])
    );

    // Aggregate data
    const totalPageViews = events.filter(
      (e) => e.event_type === "page_view"
    ).length;

    const totalCTAClicks = events.filter(
      (e) => e.event_type === "link_click" && e.entity_type === "cta_button"
    ).length;

    const totalVideoClicks = events.filter(
      (e) => e.event_type === "link_click" && e.entity_type === "media"
    ).length;

    const totalFAQClicks = events.filter(
      (e) => e.event_type === "link_click" && e.entity_type === "faq_item"
    ).length;

    const totalSessionStarts = events.filter(
      (e) => e.event_type === "session_start"
    ).length;

    const uniqueSessions = new Set(
      events.map((e) => e.session_id).filter((id) => id !== null)
    ).size;

    // Daily aggregation for page views
    const pageViewsByDate = new Map<string, number>();
    events
      .filter((e) => e.event_type === "page_view")
      .forEach((e) => {
        const date = new Date(e.created_at).toISOString().split("T")[0];
        pageViewsByDate.set(date, (pageViewsByDate.get(date) || 0) + 1);
      });

    const pageViewsSeries: DailyPoint[] = Array.from(pageViewsByDate.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Daily aggregation for CTA clicks
    const ctaClicksByDate = new Map<string, number>();
    events
      .filter(
        (e) => e.event_type === "link_click" && e.entity_type === "cta_button"
      )
      .forEach((e) => {
        const date = new Date(e.created_at).toISOString().split("T")[0];
        ctaClicksByDate.set(date, (ctaClicksByDate.get(date) || 0) + 1);
      });

    const ctaClicksSeries: DailyPoint[] = Array.from(ctaClicksByDate.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Daily aggregation for session starts (website visits)
    const sessionStartsByDate = new Map<string, number>();
    events
      .filter((e) => e.event_type === "session_start")
      .forEach((e) => {
        const date = new Date(e.created_at).toISOString().split("T")[0];
        sessionStartsByDate.set(date, (sessionStartsByDate.get(date) || 0) + 1);
      });

    const sessionStartsSeries: DailyPoint[] = Array.from(sessionStartsByDate.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Daily aggregation for video clicks
    const videoClicksByDate = new Map<string, number>();
    events
      .filter(
        (e) => e.event_type === "link_click" && e.entity_type === "media"
      )
      .forEach((e) => {
        const date = new Date(e.created_at).toISOString().split("T")[0];
        videoClicksByDate.set(date, (videoClicksByDate.get(date) || 0) + 1);
      });

    const videoClicksSeries: DailyPoint[] = Array.from(videoClicksByDate.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Daily aggregation for FAQ clicks
    const faqClicksByDate = new Map<string, number>();
    events
      .filter(
        (e) => e.event_type === "link_click" && e.entity_type === "faq_item"
      )
      .forEach((e) => {
        const date = new Date(e.created_at).toISOString().split("T")[0];
        faqClicksByDate.set(date, (faqClicksByDate.get(date) || 0) + 1);
      });

    const faqClicksSeries: DailyPoint[] = Array.from(faqClicksByDate.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Top CTAs with location
    const ctaClicks = events.filter(
      (e) => e.event_type === "link_click" && e.entity_type === "cta_button"
    );

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

    const topCTAsSplitted = Array.from(ctaCounts.values())
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

    // Top countries - all events
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

    // Top countries by FAQ click
    const countriesByFAQClick = new Map<string, number>();
    events
      .filter(
        (e) =>
          e.event_type === "link_click" &&
          e.entity_type === "faq_item" &&
          e.country !== null
      )
      .forEach((e) => {
        countriesByFAQClick.set(
          e.country!,
          (countriesByFAQClick.get(e.country!) || 0) + 1
        );
      });

    const topCountriesByFAQClick = Array.from(countriesByFAQClick.entries())
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Top FAQs
    const faqClicks = events.filter(
      (e) => e.event_type === "link_click" && e.entity_type === "faq_item"
    );

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

    // Aggregate cities (only if country filter is applied)
    let topCities: Array<{ city: string; count: number }> = [];
    let topCitiesBySessionStart: Array<{ city: string; count: number }> = [];
    let topCitiesByPageView: Array<{ city: string; count: number }> = [];
    let topCitiesByCTAClick: Array<{ city: string; count: number }> = [];
    let topCitiesByVideoClick: Array<{ city: string; count: number }> = [];

    if (country) {
      const cityCounts = new Map<string, number>();
      events.filter((e) => e.city !== null).forEach((e) => {
        cityCounts.set(e.city!, (cityCounts.get(e.city!) || 0) + 1);
      });
      topCities = Array.from(cityCounts.entries())
        .map(([city, count]) => ({ city, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 20);

      const citiesBySessionStart = new Map<string, number>();
      events.filter((e) => e.event_type === "session_start" && e.city !== null).forEach((e) => {
        citiesBySessionStart.set(e.city!, (citiesBySessionStart.get(e.city!) || 0) + 1);
      });
      topCitiesBySessionStart = Array.from(citiesBySessionStart.entries())
        .map(([city, count]) => ({ city, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      const citiesByPageView = new Map<string, number>();
      events.filter((e) => e.event_type === "page_view" && e.city !== null).forEach((e) => {
        citiesByPageView.set(e.city!, (citiesByPageView.get(e.city!) || 0) + 1);
      });
      topCitiesByPageView = Array.from(citiesByPageView.entries())
        .map(([city, count]) => ({ city, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      const citiesByCTAClick = new Map<string, number>();
      events.filter((e) => e.event_type === "link_click" && e.entity_type === "cta_button" && e.city !== null).forEach((e) => {
        citiesByCTAClick.set(e.city!, (citiesByCTAClick.get(e.city!) || 0) + 1);
      });
      topCitiesByCTAClick = Array.from(citiesByCTAClick.entries())
        .map(([city, count]) => ({ city, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      const citiesByVideoClick = new Map<string, number>();
      events.filter((e) => e.event_type === "link_click" && e.entity_type === "media" && e.city !== null).forEach((e) => {
        citiesByVideoClick.set(e.city!, (citiesByVideoClick.get(e.city!) || 0) + 1);
      });
      topCitiesByVideoClick = Array.from(citiesByVideoClick.entries())
        .map(([city, count]) => ({ city, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
    }

    return NextResponse.json({
      totalPageViews,
      totalCTAClicks,
      totalVideoClicks,
      totalFAQClicks,
      totalSessionStarts,
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
      topCities,
      topCitiesBySessionStart,
      topCitiesByPageView,
      topCitiesByCTAClick,
      topCitiesByVideoClick,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}

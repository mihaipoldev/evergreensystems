import { Suspense } from "react";
import { AdminPageTitle } from "@/components/admin/AdminPageTitle";
import { AnalyticsDashboard } from "@/components/admin/AnalyticsDashboard";
import { DashboardTimeScope } from "@/components/admin/DashboardTimeScope";
import { createServiceRoleClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

// Force dynamic rendering to ensure fresh data
export const dynamic = 'force-dynamic';

type CountryAnalyticsPageProps = {
  params: Promise<{ country: string }>;
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
  topCTAs: Array<{ id: string; label: string; clicks: number; location: string }>;
  topFAQs: Array<{ id: string; question: string; clicks: number }>;
  topLocations: Array<{ location: string; clicks: number }>;
  topCountries: Array<{ country: string; count: number }>;
  topCountriesBySessionStart: Array<{ country: string; count: number }>;
  topCountriesByPageView: Array<{ country: string; count: number }>;
  topCountriesByCTAClick: Array<{ country: string; count: number }>;
  topCountriesByVideoClick: Array<{ country: string; count: number }>;
  topCountriesByFAQClick: Array<{ country: string; count: number }>;
  topCities: Array<{ city: string; count: number }>;
  topCitiesBySessionStart: Array<{ city: string; count: number }>;
  topCitiesByPageView: Array<{ city: string; count: number }>;
  topCitiesByCTAClick: Array<{ city: string; count: number }>;
  topCitiesByVideoClick: Array<{ city: string; count: number }>;
};

const countryList: Array<{ name: string; code: string }> = [
  { name: "United States", code: "US" },
  { name: "United Kingdom", code: "GB" },
  { name: "Canada", code: "CA" },
  { name: "Germany", code: "DE" },
  { name: "France", code: "FR" },
  { name: "Italy", code: "IT" },
  { name: "Spain", code: "ES" },
  { name: "Netherlands", code: "NL" },
  { name: "Belgium", code: "BE" },
  { name: "Switzerland", code: "CH" },
  { name: "Austria", code: "AT" },
  { name: "Sweden", code: "SE" },
  { name: "Norway", code: "NO" },
  { name: "Denmark", code: "DK" },
  { name: "Finland", code: "FI" },
  { name: "Poland", code: "PL" },
  { name: "Czech Republic", code: "CZ" },
  { name: "Romania", code: "RO" },
  { name: "Hungary", code: "HU" },
  { name: "Greece", code: "GR" },
  { name: "Portugal", code: "PT" },
  { name: "Ireland", code: "IE" },
  { name: "Australia", code: "AU" },
  { name: "New Zealand", code: "NZ" },
  { name: "Japan", code: "JP" },
  { name: "South Korea", code: "KR" },
  { name: "China", code: "CN" },
  { name: "India", code: "IN" },
  { name: "Brazil", code: "BR" },
  { name: "Mexico", code: "MX" },
  { name: "Argentina", code: "AR" },
  { name: "Chile", code: "CL" },
  { name: "South Africa", code: "ZA" },
  { name: "Israel", code: "IL" },
  { name: "Turkey", code: "TR" },
  { name: "Russia", code: "RU" },
  { name: "Ukraine", code: "UA" },
  { name: "Singapore", code: "SG" },
  { name: "Malaysia", code: "MY" },
  { name: "Thailand", code: "TH" },
  { name: "Indonesia", code: "ID" },
  { name: "Philippines", code: "PH" },
  { name: "Vietnam", code: "VN" },
];

const countryNameToCode: Record<string, string> = Object.fromEntries(
  countryList.map(({ name, code }) => [name, code])
);

const countryCodeToName: Record<string, string> = Object.fromEntries(
  countryList.map(({ name, code }) => [code.toUpperCase(), name])
);

const getCountryCode = (countryName: string) =>
  countryNameToCode[countryName] || countryName.substring(0, 2).toUpperCase();

const getCountryDisplayName = (country: string) => {
  const upper = country.toUpperCase();
  return countryCodeToName[upper] || country;
};

const getFlagEmoji = (countryName: string) => {
  const code = getCountryCode(countryName);
  if (code.length !== 2) return "🌐";
  return code
    .toUpperCase()
    .split("")
    .map((char) => String.fromCodePoint(127397 + char.charCodeAt(0)))
    .join("");
};

async function CountryAnalyticsContent({ country, scope }: { country: string; scope: string }) {
  // Use service role client for admin analytics to bypass RLS issues
  // This is safe because middleware already protects the route
  const supabase = createServiceRoleClient();
  
  // Decode country name from URL
  const decodedCountry = decodeURIComponent(country);
  
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

  // Get analytics events filtered by country
  let eventsQuery = supabase
    .from("analytics_events")
    .select("*")
    .eq("country", decodedCountry)
    .gte("created_at", lookbackISO);

  const { data: events, error: eventsError } = await eventsQuery as { data: AnalyticsEvent[] | null; error: any };

  let data: AnalyticsData;

  if (eventsError || !events || events.length === 0) {
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
      topCTAs: [],
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
    };
  } else {
    // Get CTA buttons and FAQ items for enrichment
    const { data: ctaButtons } = await supabase
      .from("cta_buttons")
      .select("id, label") as { data: Array<{ id: string; label: string }> | null };

    const { data: faqItems } = await supabase
      .from("faq_items")
      .select("id, question") as { data: Array<{ id: string; question: string }> | null };

    const ctaButtonMap = new Map((ctaButtons || []).map((btn) => [btn.id, btn.label]));
    const faqItemMap = new Map((faqItems || []).map((item) => [item.id, item.question]));

    // Aggregate events by type (all events are already filtered by country)
    const pageViews = events.filter((e) => e.event_type === "page_view");
    const ctaClicks = events.filter((e) => e.event_type === "link_click" && e.entity_type === "cta_button");
    const videoClicks = events.filter((e) => e.event_type === "link_click" && e.entity_type === "media");
    const faqClicks = events.filter((e) => e.event_type === "link_click" && e.entity_type === "faq_item");
    const sessionStarts = events.filter((e) => e.event_type === "session_start");

    const uniqueSessions = new Set(events.map((e) => e.session_id).filter((id) => id !== null)).size;

    // Daily aggregation
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

    // Top CTAs
    const ctaCounts = new Map<string, { clicks: number; location: string; label: string; entityId: string }>();
    ctaClicks.forEach((e) => {
      const metadata = e.metadata as any;
      const location = metadata?.location || "unknown";
      const key = `${e.entity_id}::${location}`;
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
      .map((entry) => ({
        id: entry.entityId,
        label: entry.label,
        clicks: entry.clicks,
        location: entry.location,
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

    // For country-specific page, topCountries will just show the selected country
    // We can still calculate it for consistency, but it will only have one entry
    const topCountries = [{ country: decodedCountry, count: events.length }];

    // Country-specific breakdowns (all will be the same country, but we calculate for consistency)
    const topCountriesBySessionStart = sessionStarts.length > 0 
      ? [{ country: decodedCountry, count: sessionStarts.length }]
      : [];
    
    const topCountriesByPageView = pageViews.length > 0
      ? [{ country: decodedCountry, count: pageViews.length }]
      : [];
    
    const topCountriesByCTAClick = ctaClicks.length > 0
      ? [{ country: decodedCountry, count: ctaClicks.length }]
      : [];
    
    const topCountriesByVideoClick = videoClicks.length > 0
      ? [{ country: decodedCountry, count: videoClicks.length }]
      : [];
    
    const topCountriesByFAQClick = faqClicks.length > 0
      ? [{ country: decodedCountry, count: faqClicks.length }]
      : [];

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

    // Aggregate cities (for country-specific page, we show cities instead of countries)
    const cityCounts = new Map<string, number>();
    events.filter((e) => e.city !== null).forEach((e) => {
      cityCounts.set(e.city!, (cityCounts.get(e.city!) || 0) + 1);
    });
    const topCities = Array.from(cityCounts.entries())
      .map(([city, count]) => ({ city, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);

    const citiesBySessionStart = new Map<string, number>();
    events.filter((e) => e.event_type === "session_start" && e.city !== null).forEach((e) => {
      citiesBySessionStart.set(e.city!, (citiesBySessionStart.get(e.city!) || 0) + 1);
    });
    const topCitiesBySessionStart = Array.from(citiesBySessionStart.entries())
      .map(([city, count]) => ({ city, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const citiesByPageView = new Map<string, number>();
    events.filter((e) => e.event_type === "page_view" && e.city !== null).forEach((e) => {
      citiesByPageView.set(e.city!, (citiesByPageView.get(e.city!) || 0) + 1);
    });
    const topCitiesByPageView = Array.from(citiesByPageView.entries())
      .map(([city, count]) => ({ city, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const citiesByCTAClick = new Map<string, number>();
    events.filter((e) => e.event_type === "link_click" && e.entity_type === "cta_button" && e.city !== null).forEach((e) => {
      citiesByCTAClick.set(e.city!, (citiesByCTAClick.get(e.city!) || 0) + 1);
    });
    const topCitiesByCTAClick = Array.from(citiesByCTAClick.entries())
      .map(([city, count]) => ({ city, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const citiesByVideoClick = new Map<string, number>();
    events.filter((e) => e.event_type === "link_click" && e.entity_type === "media" && e.city !== null).forEach((e) => {
      citiesByVideoClick.set(e.city!, (citiesByVideoClick.get(e.city!) || 0) + 1);
    });
    const topCitiesByVideoClick = Array.from(citiesByVideoClick.entries())
      .map(([city, count]) => ({ city, count }))
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
      topCTAs,
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
    };
  }

  return (
    <>
      {/*
        Use display name for UI so codes like "US" show as "United States"
        while keeping the raw code for filtering.
      */}
      <AdminPageTitle
        title={getCountryDisplayName(decodedCountry)}
        description={`View analytics and performance metrics for ${getCountryDisplayName(decodedCountry)}.`}
        rightSideContent={<DashboardTimeScope />}
        icon={<span className="text-3xl leading-none">{getFlagEmoji(decodedCountry)}</span>}
      />
      <AnalyticsDashboard data={data} />
    </>
  );
}

export default async function CountryAnalyticsPage({ params, searchParams }: CountryAnalyticsPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const country = resolvedParams.country;
  const scope = resolvedSearchParams.scope || "30";

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
      <CountryAnalyticsContent country={country} scope={scope} />
    </Suspense>
  );
}

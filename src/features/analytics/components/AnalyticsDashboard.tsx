"use client";

import * as React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { startTransition } from "react";
import { Tabs, TabsContent, TabsList } from "@/components/ui/tabs";
import { AnalyticsMetricTab } from "./AnalyticsMetricTab";
import { AnalyticsLineChart, type DailyPoint } from "./AnalyticsLineChart";
import { CountryList } from "./CountryList";
import { CityList } from "./CityList";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type TabValue = "visits" | "pageviews" | "clicks" | "videos" | "faq-clicks";

const TAB_STORAGE_KEY = "admin-analytics-tab";
const TAB_COOKIE_NAME = "admin-analytics-tab";

function getStoredTab(): TabValue {
  if (typeof window === "undefined") return "visits";
  const stored = localStorage.getItem(TAB_STORAGE_KEY);
  if (stored && ["visits", "pageviews", "clicks", "videos", "faq-clicks"].includes(stored)) {
    return stored as TabValue;
  }
  return "visits";
}

function setStoredTab(tab: TabValue) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TAB_STORAGE_KEY, tab);
  // Also set cookie for server-side access
  document.cookie = `${TAB_COOKIE_NAME}=${tab}; path=/; max-age=${365 * 24 * 60 * 60}; SameSite=Lax`;
}

type AnalyticsDashboardData = {
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
  topCTAsSplitted: Array<{
    id: string;
    label: string;
    clicks: number;
    location: string;
  }>;
  topCTAsAggregated: Array<{
    id: string;
    label: string;
    clicks: number;
  }>;
  topFAQs: Array<{
    id: string;
    question: string;
    clicks: number;
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
  topCountriesByFAQClick: Array<{
    country: string;
    count: number;
  }>;
  topCities?: Array<{
    city: string;
    count: number;
  }>;
  topCitiesBySessionStart?: Array<{
    city: string;
    count: number;
  }>;
  topCitiesByPageView?: Array<{
    city: string;
    count: number;
  }>;
  topCitiesByCTAClick?: Array<{
    city: string;
    count: number;
  }>;
  topCitiesByVideoClick?: Array<{
    city: string;
    count: number;
  }>;
};

type AnalyticsDashboardProps = {
  data: AnalyticsDashboardData;
};

const locationLabels: Record<string, string> = {
  header: "Header",
  hero_section: "Hero Section",
  cta_section: "CTA Section",
  unknown: "Unknown",
};

export function AnalyticsDashboard({ data }: AnalyticsDashboardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = React.useState(false);
  
  // Get tab from URL param, or localStorage, or default to "visits"
  const urlTab = searchParams.get("tab") as TabValue | null;
  const storedTab = getStoredTab();
  
  // Use local state for instant tab switching (no delay)
  // Initialize from URL or stored value
  const [localTab, setLocalTab] = React.useState<TabValue>(() => {
    return urlTab || storedTab || "visits";
  });
  
  // Track if we're updating from user action (to prevent sync loop)
  const isUserActionRef = React.useRef(false);
  
  // Sync local state with URL when URL changes externally (e.g., browser back/forward, initial load)
  React.useEffect(() => {
    // Only sync if it's not a user action
    if (!isUserActionRef.current && urlTab && urlTab !== localTab) {
      setLocalTab(urlTab);
    }
    // Reset the flag after sync check
    isUserActionRef.current = false;
  }, [urlTab, localTab]);
  
  // On mount, sync URL with localStorage if needed
  React.useEffect(() => {
    setMounted(true);
    if (!urlTab && storedTab !== "visits") {
      // If no URL param but we have a stored tab (not default), update URL
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", storedTab);
      setLocalTab(storedTab);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    } else if (urlTab) {
      setLocalTab(urlTab);
      if (urlTab !== storedTab) {
        // If URL param differs from stored, update localStorage and cookie
        setStoredTab(urlTab);
      }
    }
  }, []); // Only run on mount
  
  // Handle tab change - instant update using local state
  const handleTabChange = (value: string) => {
    const tabValue = value as TabValue;
    
    // Mark as user action to prevent sync effect from overriding
    isUserActionRef.current = true;
    
    // Update local state immediately for instant UI feedback
    setLocalTab(tabValue);
    
    // Save to localStorage and cookie immediately
    setStoredTab(tabValue);
    
    // Update URL using router.replace with scroll: false (shallow update, no full reload)
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tabValue);
    const newUrl = `${pathname}?${params.toString()}`;
    
    // Use router.replace with scroll: false for shallow navigation (no page refresh)
    router.replace(newUrl, { scroll: false });
  };
  
  // Use localTab for the controlled tab value (instant updates)
  const currentTab = localTab;
  
  // Debug logging - show in browser console
  React.useEffect(() => {
    console.log('[Analytics Dashboard] Received data:', {
      timestamp: new Date().toISOString(),
      totalPageViews: data.totalPageViews,
      totalCTAClicks: data.totalCTAClicks,
      totalVideoClicks: data.totalVideoClicks,
      totalFAQClicks: data.totalFAQClicks,
      totalSessionStarts: data.totalSessionStarts,
      pageViewsSeriesLength: data.pageViewsSeries?.length || 0,
      ctaClicksSeriesLength: data.ctaClicksSeries?.length || 0,
      topCTAsAggregated: data.topCTAsAggregated?.length || 0,
      topCountriesByCTAClick: data.topCountriesByCTAClick?.length || 0,
    });
  }, [data]);
  const {
    totalPageViews,
    totalCTAClicks,
    totalSessionStarts,
    totalVideoClicks,
    totalFAQClicks = 0,
    pageViewsSeries,
    ctaClicksSeries,
    sessionStartsSeries,
    videoClicksSeries,
    faqClicksSeries = [],
    topCTAsSplitted = [],
    topCTAsAggregated = [],
    topFAQs = [],
    topLocations,
    topCountries,
    topCountriesBySessionStart,
    topCountriesByPageView,
    topCountriesByCTAClick,
    topCountriesByVideoClick,
    topCountriesByFAQClick = [],
    topCities,
    topCitiesBySessionStart,
    topCitiesByPageView,
    topCitiesByCTAClick,
    topCitiesByVideoClick,
  } = data;

  // Debug: Log FAQ analytics data
  React.useEffect(() => {
    console.log("FAQ Analytics Dashboard Data:", {
      totalFAQClicks,
      faqClicksSeriesLength: faqClicksSeries?.length || 0,
      faqClicksSeries: faqClicksSeries,
      topFAQsLength: topFAQs?.length || 0,
      topFAQs: topFAQs,
      topCountriesByFAQClickLength: topCountriesByFAQClick?.length || 0,
      topCountriesByFAQClick: topCountriesByFAQClick,
    });
  }, [totalFAQClicks, faqClicksSeries, topFAQs, topCountriesByFAQClick]);

  // Determine if we should show cities (country-specific view) or countries (global view)
  const showCities = topCities !== undefined && topCities.length > 0;

  // State for CTA view toggle (true = splitted view, false = database/aggregated view)
  const [isSplittedView, setIsSplittedView] = React.useState(false);

  const handleCTAClick = (ctaId: string) => {
    const scope = searchParams.get("scope") || "30";
    const tab = searchParams.get("tab") || storedTab;
    router.push(`/admin/analytics/cta/${ctaId}?scope=${scope}&tab=${tab}`);
  };

  const handleFAQClick = (faqId: string) => {
    const scope = searchParams.get("scope") || "30";
    const tab = searchParams.get("tab") || storedTab;
    router.push(`/admin/analytics/faq/${faqId}?scope=${scope}&tab=${tab}`);
  };
  
  // Helper function to create country navigation URL with scope and tab
  const createCountryUrl = (country: string) => {
    const scope = searchParams.get("scope") || "30";
    const tab = searchParams.get("tab") || storedTab;
    const encodedCountry = encodeURIComponent(country);
    return `/admin/analytics/country/${encodedCountry}?scope=${scope}&tab=${tab}`;
  };


  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-8">
      <div
        className="rounded-xl overflow-hidden text-card-foreground dark:bg-card bg-card shadow-lg transition-all duration-300 hover:shadow-xl"
      >
        <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="flex flex-row md:grid md:grid-cols-5 w-full bg-transparent p-0 gap-0 h-auto min-h-[88px] rounded-none">
            <AnalyticsMetricTab
              value="visits"
              label="Website Visits"
              metric={totalSessionStarts}
              className="border-r border-border/30 flex-1 md:flex-none min-w-0"
            />
            <AnalyticsMetricTab
              value="pageviews"
              label="Page Views"
              metric={totalPageViews}
              className="border-r border-border/30 flex-1 md:flex-none min-w-0"
            />
            <AnalyticsMetricTab
              value="clicks"
              label="CTA Clicks"
              metric={totalCTAClicks}
              className="border-r border-border/30 flex-1 md:flex-none min-w-0"
            />
            <AnalyticsMetricTab
              value="videos"
              label="Video Clicks"
              metric={totalVideoClicks}
              className="border-r border-border/30 flex-1 md:flex-none min-w-0"
            />
            <AnalyticsMetricTab
              value="faq-clicks"
              label="FAQ Clicks"
              metric={totalFAQClicks}
              className="flex-1 md:flex-none min-w-0"
            />
          </TabsList>

          <TabsContent value="visits" className="mt-0 dark:bg-transparent">
            <div className="w-full min-w-0 pr-2 md:pr-6 pl-2 pt-6 md:pt-10 pb-4 md:pb-6 overflow-hidden space-y-6">
              <AnalyticsLineChart data={sessionStartsSeries} />
              <div className="pt-4">
                <h3 className="text-sm font-semibold mb-4 px-3">{showCities ? "Top Cities" : "Top Countries"}</h3>
                {showCities ? (
                  <CityList cities={topCitiesBySessionStart || []} />
                ) : (
                  <CountryList 
                    countries={topCountriesBySessionStart}
                    onCountryClick={(country) => {
                      router.push(createCountryUrl(country));
                    }}
                  />
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="pageviews" className="mt-0 dark:bg-transparent">
            <div className="w-full min-w-0 pr-2 md:pr-6 pl-2 pt-6 md:pt-10 pb-4 md:pb-6 overflow-hidden space-y-6">
              <AnalyticsLineChart data={pageViewsSeries} />
              <div className="pt-4">
                <h3 className="text-sm font-semibold mb-4 px-3">{showCities ? "Top Cities" : "Top Countries"}</h3>
                {showCities ? (
                  <CityList cities={topCitiesByPageView || []} />
                ) : (
                  <CountryList 
                    countries={topCountriesByPageView}
                    onCountryClick={(country) => {
                      router.push(createCountryUrl(country));
                    }}
                  />
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="clicks" className="mt-0 dark:bg-transparent">
            <div className="w-full min-w-0 pr-2 md:pr-6 pl-2 pt-6 md:pt-10 pb-4 md:pb-6 overflow-hidden space-y-6">
              <AnalyticsLineChart data={ctaClicksSeries} />
              <div className="space-y-8">
                <div>
                  <h3 className="text-sm font-semibold mb-4 px-3">{showCities ? "Top Cities" : "Top Countries"}</h3>
                  {showCities ? (
                    <CityList cities={topCitiesByCTAClick || []} />
                  ) : (
                    <CountryList 
                      countries={topCountriesByCTAClick}
                      onCountryClick={(country) => {
                        router.push(createCountryUrl(country));
                      }}
                    />
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4 px-3">
                    <h3 className="text-sm font-semibold">Top Performing CTAs</h3>
                    <div className="inline-flex items-center rounded-md border border-input bg-card p-0.5 shadow-sm">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsSplittedView(false)}
                        className={cn(
                          "h-7 px-2.5 text-xs font-normal rounded-sm transition-all",
                          !isSplittedView
                            ? "bg-background text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground bg-transparent"
                        )}
                      >
                        Database
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsSplittedView(true)}
                        className={cn(
                          "h-7 px-2.5 text-xs font-normal rounded-sm transition-all",
                          isSplittedView
                            ? "bg-background text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground bg-transparent"
                        )}
                      >
                        Splitted
                      </Button>
                    </div>
                  </div>
                  <div className="overflow-x-auto px-4">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-muted-foreground border-b">
                          <th className="py-3 pr-4">CTA Button</th>
                          {isSplittedView && <th className="py-3 pr-4 w-32">Location</th>}
                          <th className="py-3 pr-4 w-24 text-right">Clicks</th>
                        </tr>
                      </thead>
                      <tbody>
                        {isSplittedView ? (
                          <>
                            {topCTAsSplitted.slice(0, 10).map((cta, index) => (
                              <tr 
                                key={`${cta.id}-${cta.location}-${index}`} 
                                className="border-b cursor-pointer hover:bg-muted/50 transition-colors"
                                onClick={() => handleCTAClick(cta.id)}
                              >
                                <td className="py-3 pr-4">
                                  <span className="font-medium">{cta.label}</span>
                                </td>
                                <td className="py-3 pr-4 w-32">
                                  <span className="text-muted-foreground text-xs">
                                    {locationLabels[cta.location] || cta.location}
                                  </span>
                                </td>
                                <td className="py-3 pr-4 w-24 text-right tabular-nums font-semibold">{cta.clicks}</td>
                              </tr>
                            ))}
                            {topCTAsSplitted.length === 0 && (
                              <tr>
                                <td colSpan={3} className="py-6 text-center text-muted-foreground">
                                  No data yet.
                                </td>
                              </tr>
                            )}
                          </>
                        ) : (
                          <>
                            {topCTAsAggregated.slice(0, 10).map((cta, index) => (
                              <tr 
                                key={`${cta.id}-${index}`} 
                                className="border-b cursor-pointer hover:bg-muted/50 transition-colors"
                                onClick={() => handleCTAClick(cta.id)}
                              >
                                <td className="py-3 pr-4">
                                  <span className="font-medium">{cta.label}</span>
                                </td>
                                <td className="py-3 pr-4 w-24 text-right tabular-nums font-semibold">{cta.clicks}</td>
                              </tr>
                            ))}
                            {topCTAsAggregated.length === 0 && (
                              <tr>
                                <td colSpan={2} className="py-6 text-center text-muted-foreground">
                                  No data yet.
                                </td>
                              </tr>
                            )}
                          </>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="videos" className="mt-0 dark:bg-transparent">
            <div className="w-full min-w-0 pr-2 md:pr-6 pl-2 pt-6 md:pt-10 pb-4 md:pb-6 overflow-hidden space-y-6">
              <AnalyticsLineChart data={videoClicksSeries} />
              <div className="pt-4">
                <h3 className="text-sm font-semibold mb-4 px-3">{showCities ? "Top Cities" : "Top Countries"}</h3>
                {showCities ? (
                  <CityList cities={topCitiesByVideoClick || []} />
                ) : (
                  <CountryList 
                    countries={topCountriesByVideoClick}
                    onCountryClick={(country) => {
                      router.push(createCountryUrl(country));
                    }}
                  />
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="faq-clicks" className="mt-0 dark:bg-transparent">
            <div className="w-full min-w-0 pr-2 md:pr-6 pl-2 pt-6 md:pt-10 pb-4 md:pb-6 overflow-hidden space-y-6">
              <AnalyticsLineChart data={faqClicksSeries || []} />
              <div className="space-y-8">
                <div>
                  <h3 className="text-sm font-semibold mb-4 px-3">{showCities ? "Top Cities" : "Top Countries"}</h3>
                  {showCities ? (
                    <CityList cities={[]} />
                  ) : (
                    <CountryList 
                      countries={topCountriesByFAQClick || []}
                      onCountryClick={(country) => {
                        router.push(createCountryUrl(country));
                      }}
                    />
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-semibold mb-4 px-3">Top Performing FAQs</h3>
                  <div className="overflow-x-auto px-4">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-muted-foreground border-b">
                          <th className="py-3 pr-4">FAQ Question</th>
                          <th className="py-3 pr-4 w-24 text-right">Clicks</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(topFAQs || []).slice(0, 10).map((faq, index) => (
                          <tr 
                            key={`${faq.id}-${index}`} 
                            className="border-b cursor-pointer hover:bg-muted/50 transition-colors"
                            onClick={() => handleFAQClick(faq.id)}
                          >
                            <td className="py-3 pr-4">
                              <span className="font-medium">{faq.question}</span>
                            </td>
                            <td className="py-3 pr-4 w-24 text-right tabular-nums font-semibold">{faq.clicks}</td>
                          </tr>
                        ))}
                        {(!topFAQs || topFAQs.length === 0) && (
                          <tr>
                            <td colSpan={2} className="py-6 text-center text-muted-foreground">
                              No data yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

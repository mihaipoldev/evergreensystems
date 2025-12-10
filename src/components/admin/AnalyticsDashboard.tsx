"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList } from "@/components/ui/tabs";
import { AdminMetricTab } from "@/components/admin/AdminMetricTab";
import { AnalyticsLineChart, type DailyPoint } from "@/components/admin/AnalyticsLineChart";
import { CountryList } from "@/components/admin/CountryList";
import { CityList } from "@/components/admin/CityList";

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
  topCTAs: Array<{
    id: string;
    label: string;
    clicks: number;
    location: string;
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
  const searchParams = useSearchParams();
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
    topCTAs,
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

  const handleCTAClick = (ctaId: string) => {
    const scope = searchParams.get("scope") || "30";
    router.push(`/admin/analytics/cta/${ctaId}?scope=${scope}`);
  };

  const handleFAQClick = (faqId: string) => {
    const scope = searchParams.get("scope") || "30";
    router.push(`/admin/analytics/faq/${faqId}?scope=${scope}`);
  };


  return (
    <div className="mx-auto w-full max-w-6xl space-y-8">
      <div
        className="rounded-xl overflow-hidden text-card-foreground dark:bg-card bg-card shadow-lg transition-all duration-300 hover:shadow-xl"
      >
        <Tabs defaultValue="visits" className="w-full">
          <TabsList className="flex flex-row md:grid md:grid-cols-5 w-full bg-transparent p-0 gap-0 h-auto min-h-[88px] rounded-none">
            <AdminMetricTab
              value="visits"
              label="Website Visits"
              metric={totalSessionStarts}
              className="border-r border-border/30 flex-1 md:flex-none min-w-0"
            />
            <AdminMetricTab
              value="pageviews"
              label="Page Views"
              metric={totalPageViews}
              className="border-r border-border/30 flex-1 md:flex-none min-w-0"
            />
            <AdminMetricTab
              value="clicks"
              label="CTA Clicks"
              metric={totalCTAClicks}
              className="border-r border-border/30 flex-1 md:flex-none min-w-0"
            />
            <AdminMetricTab
              value="videos"
              label="Video Clicks"
              metric={totalVideoClicks}
              className="border-r border-border/30 flex-1 md:flex-none min-w-0"
            />
            <AdminMetricTab
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
                      const scope = searchParams.get("scope") || "30";
                      const encodedCountry = encodeURIComponent(country);
                      router.push(`/admin/analytics/country/${encodedCountry}?scope=${scope}`);
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
                      const scope = searchParams.get("scope") || "30";
                      const encodedCountry = encodeURIComponent(country);
                      router.push(`/admin/analytics/country/${encodedCountry}?scope=${scope}`);
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
                        const scope = searchParams.get("scope") || "30";
                        const encodedCountry = encodeURIComponent(country);
                        router.push(`/admin/analytics/country/${encodedCountry}?scope=${scope}`);
                      }}
                    />
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-semibold mb-4 px-3">Top Performing CTAs</h3>
                  <div className="overflow-x-auto px-4">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-muted-foreground border-b">
                          <th className="py-3 pr-4">CTA Button</th>
                          <th className="py-3 pr-4 w-32">Location</th>
                          <th className="py-3 pr-4 w-24 text-right">Clicks</th>
                        </tr>
                      </thead>
                      <tbody>
                        {topCTAs.slice(0, 10).map((cta, index) => (
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
                        {topCTAs.length === 0 && (
                          <tr>
                            <td colSpan={3} className="py-6 text-center text-muted-foreground">
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
                      const scope = searchParams.get("scope") || "30";
                      const encodedCountry = encodeURIComponent(country);
                      router.push(`/admin/analytics/country/${encodedCountry}?scope=${scope}`);
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
                        const scope = searchParams.get("scope") || "30";
                        const encodedCountry = encodeURIComponent(country);
                        router.push(`/admin/analytics/country/${encodedCountry}?scope=${scope}`);
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

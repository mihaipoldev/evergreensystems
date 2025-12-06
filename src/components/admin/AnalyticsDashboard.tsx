"use client";

import * as React from "react";
import { Tabs, TabsContent, TabsList } from "@/components/ui/tabs";
import { AdminMetricTab } from "@/components/admin/AdminMetricTab";
import { AnalyticsLineChart, type DailyPoint } from "@/components/admin/AnalyticsLineChart";
import { CountryList } from "@/components/admin/CountryList";
import { getCardGradient } from "@/lib/gradient-presets";
import { cn } from "@/lib/utils";

type AnalyticsDashboardData = {
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
  const {
    totalPageViews,
    totalCTAClicks,
    totalSessionStarts,
    totalVideoClicks,
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
  } = data;


  return (
    <div className="mx-auto w-full max-w-6xl space-y-8">
      <div
        className={cn(
          "rounded-xl overflow-hidden bg-card/50 text-card-foreground dark:bg-card/30 shadow-lg transition-all duration-300 hover:shadow-xl",
          getCardGradient()
        )}
      >
        <Tabs defaultValue="visits" className="w-full">
          <TabsList className="flex flex-row md:grid md:grid-cols-4 w-full bg-transparent p-0 gap-0 h-auto min-h-[88px] border-b border-border/30 rounded-none">
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
              className="flex-1 md:flex-none min-w-0"
            />
          </TabsList>

          <TabsContent value="visits" className="mt-0 dark:bg-transparent">
            <div className="w-full min-w-0 pr-2 md:pr-6 pl-2 pt-6 md:pt-10 pb-4 md:pb-6 overflow-hidden space-y-6">
              <AnalyticsLineChart data={sessionStartsSeries} />
              <div className="pt-4 border-t">
                <h3 className="text-sm font-semibold mb-4">Top Countries</h3>
                <CountryList countries={topCountriesBySessionStart} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="pageviews" className="mt-0 dark:bg-transparent">
            <div className="w-full min-w-0 pr-2 md:pr-6 pl-2 pt-6 md:pt-10 pb-4 md:pb-6 overflow-hidden space-y-6">
              <AnalyticsLineChart data={pageViewsSeries} />
              <div className="pt-4 border-t">
                <h3 className="text-sm font-semibold mb-4">Top Countries</h3>
                <CountryList countries={topCountriesByPageView} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="clicks" className="mt-0 dark:bg-transparent">
            <div className="w-full min-w-0 pr-2 md:pr-6 pl-2 pt-6 md:pt-10 pb-4 md:pb-6 overflow-hidden space-y-6">
              <AnalyticsLineChart data={ctaClicksSeries} />
              <div className="pt-4 border-t">
                <h3 className="text-sm font-semibold mb-4">Top Countries</h3>
                <CountryList countries={topCountriesByCTAClick} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="videos" className="mt-0 dark:bg-transparent">
            <div className="w-full min-w-0 pr-2 md:pr-6 pl-2 pt-6 md:pt-10 pb-4 md:pb-6 overflow-hidden space-y-6">
              <AnalyticsLineChart data={videoClicksSeries} />
              <div className="pt-4 border-t">
                <h3 className="text-sm font-semibold mb-4">Top Countries</h3>
                <CountryList countries={topCountriesByVideoClick} />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Sections outside tabs */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Top Performing CTAs</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground">
                <th className="py-2 pr-4">CTA Button</th>
                <th className="py-2 pr-4 w-44">Location</th>
                <th className="py-2 pr-4 w-44">Clicks</th>
              </tr>
            </thead>
            <tbody>
              {topCTAs.map((cta, index) => (
                <tr key={`${cta.id}-${cta.location}-${index}`} className="border-t">
                  <td className="py-2 pr-4">
                    <span className="font-medium">{cta.label}</span>
                  </td>
                  <td className="py-2 pr-4 w-44">
                    <span className="text-muted-foreground">
                      {locationLabels[cta.location] || cta.location}
                    </span>
                  </td>
                  <td className="py-2 pr-4 w-44 tabular-nums">{cta.clicks}</td>
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
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Top CTA Locations</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm table-fixed">
            <thead>
              <tr className="text-left text-muted-foreground">
                <th className="py-2 pr-4 w-4/5">Location</th>
                <th className="py-2 pr-4 w-1/5">Clicks</th>
              </tr>
            </thead>
            <tbody>
              {topLocations.map((row) => (
                <tr key={row.location} className="border-t">
                  <td className="py-2 pr-4 w-4/5">
                    {locationLabels[row.location] || row.location}
                  </td>
                  <td className="py-2 pr-4 w-1/5 tabular-nums">{row.clicks}</td>
                </tr>
              ))}
              {topLocations.length === 0 && (
                <tr>
                  <td colSpan={2} className="py-6 text-center text-muted-foreground">
                    No clicks yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Top Countries</h2>
        <p className="text-sm text-muted-foreground">Based on all analytics events (page views, clicks, sessions)</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm table-fixed">
            <thead>
              <tr className="text-left text-muted-foreground">
                <th className="py-2 pr-4 w-4/5">Country</th>
                <th className="py-2 pr-4 w-1/5">Events</th>
              </tr>
            </thead>
            <tbody>
              {topCountries.slice(0, 20).map((row) => (
                <tr key={row.country} className="border-t">
                  <td className="py-2 pr-4 w-4/5">{row.country}</td>
                  <td className="py-2 pr-4 w-1/5 tabular-nums">{row.count}</td>
                </tr>
              ))}
              {topCountries.length === 0 && (
                <tr>
                  <td colSpan={2} className="py-6 text-center text-muted-foreground">
                    No data yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

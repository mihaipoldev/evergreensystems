"use client";

import * as React from "react";
import { AnalyticsLineChart, type DailyPoint } from "@/components/admin/AnalyticsLineChart";
import { CountryList } from "@/components/admin/CountryList";

type CTAAnalyticsDashboardData = {
  totalCTAClicks: number;
  ctaClicksSeries: DailyPoint[];
  topLocations: Array<{
    location: string;
    clicks: number;
  }>;
  topCountries: Array<{
    country: string;
    count: number;
  }>;
};

type CTAAnalyticsDashboardProps = {
  data: CTAAnalyticsDashboardData;
};

const locationLabels: Record<string, string> = {
  header: "Header",
  hero_section: "Hero Section",
  cta_section: "CTA Section",
  unknown: "Unknown",
};

export function CTAAnalyticsDashboard({ data }: CTAAnalyticsDashboardProps) {
  const {
    totalCTAClicks,
    ctaClicksSeries,
    topLocations,
    topCountries,
  } = data;

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8">
      <div
        className="rounded-xl overflow-hidden text-card-foreground dark:bg-card bg-card shadow-lg transition-all duration-300 hover:shadow-xl"
      >
        <div className="w-full">
          <div className="flex flex-col items-start justify-center p-2 md:p-4 h-auto min-h-[88px] border-b border-border/30">
            <div className="text-[10px] md:text-sm font-medium text-muted-foreground mb-1 leading-tight">CTA Clicks</div>
            <div className="flex items-baseline gap-2">
              <span className="text-lg md:text-2xl font-bold tabular-nums">{totalCTAClicks.toLocaleString()}</span>
            </div>
          </div>

          <div className="w-full min-w-0 pr-2 md:pr-6 pl-2 pt-6 md:pt-10 pb-4 md:pb-6 overflow-hidden space-y-6">
            <AnalyticsLineChart data={ctaClicksSeries} />
            <div className="pt-4">
              <h3 className="text-sm font-semibold mb-4 px-3">Top Countries</h3>
              <CountryList countries={topCountries} />
            </div>
          </div>
        </div>
      </div>

      {/* Sections outside chart */}
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
    </div>
  );
}

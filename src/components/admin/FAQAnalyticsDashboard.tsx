"use client";

import * as React from "react";
import { AnalyticsLineChart, type DailyPoint } from "@/components/admin/AnalyticsLineChart";
import { CountryList } from "@/components/admin/CountryList";

type FAQAnalyticsDashboardData = {
  totalFAQClicks: number;
  faqClicksSeries: DailyPoint[];
  topCountries: Array<{
    country: string;
    count: number;
  }>;
};

type FAQAnalyticsDashboardProps = {
  data: FAQAnalyticsDashboardData;
};

export function FAQAnalyticsDashboard({ data }: FAQAnalyticsDashboardProps) {
  const {
    totalFAQClicks,
    faqClicksSeries,
    topCountries,
  } = data;

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8">
      <div
        className="rounded-xl overflow-hidden text-card-foreground dark:bg-card bg-card shadow-lg transition-all duration-300 hover:shadow-xl"
      >
        <div className="w-full">
          <div className="flex flex-col items-start justify-center p-2 md:p-4 h-auto min-h-[88px] border-b border-border/30">
            <div className="text-[10px] md:text-sm font-medium text-muted-foreground mb-1 leading-tight">FAQ Clicks</div>
            <div className="flex items-baseline gap-2">
              <span className="text-lg md:text-2xl font-bold tabular-nums">{totalFAQClicks.toLocaleString()}</span>
            </div>
          </div>

          <div className="w-full min-w-0 pr-2 md:pr-6 pl-2 pt-6 md:pt-10 pb-4 md:pb-6 overflow-hidden space-y-6">
            <AnalyticsLineChart data={faqClicksSeries} />
            <div className="pt-4">
              <h3 className="text-sm font-semibold mb-4 px-3">Top Countries</h3>
              <CountryList countries={topCountries} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

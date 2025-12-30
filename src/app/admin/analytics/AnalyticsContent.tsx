"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { AdminPageTitle } from "@/components/admin/ui/AdminPageTitle";
import { AnalyticsDashboard } from "@/features/analytics/components/AnalyticsDashboard";
import { DashboardTimeScope } from "@/features/analytics/components/DashboardTimeScope";
import { PageSkeleton } from "@/components/admin/ui/PageSkeleton";

type DailyPoint = { date: string; count: number };

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

export function AnalyticsContent() {
  const searchParams = useSearchParams();
  const scope = searchParams.get("scope") || "30";
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/admin/analytics/stats?scope=${scope}`);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to fetch analytics data");
        }
        
        const analyticsData = await response.json();
        
        // Ensure we have valid data structure
        const processedData: AnalyticsData = {
          totalPageViews: analyticsData.totalPageViews || 0,
          totalCTAClicks: analyticsData.totalCTAClicks || 0,
          totalVideoClicks: analyticsData.totalVideoClicks || 0,
          totalFAQClicks: analyticsData.totalFAQClicks || 0,
          totalSessionStarts: analyticsData.totalSessionStarts || 0,
          uniqueSessions: analyticsData.uniqueSessions || 0,
          pageViewsSeries: Array.isArray(analyticsData.pageViewsSeries) ? analyticsData.pageViewsSeries : [],
          ctaClicksSeries: Array.isArray(analyticsData.ctaClicksSeries) ? analyticsData.ctaClicksSeries : [],
          sessionStartsSeries: Array.isArray(analyticsData.sessionStartsSeries) ? analyticsData.sessionStartsSeries : [],
          videoClicksSeries: Array.isArray(analyticsData.videoClicksSeries) ? analyticsData.videoClicksSeries : [],
          faqClicksSeries: Array.isArray(analyticsData.faqClicksSeries) ? analyticsData.faqClicksSeries : [],
          topCTAsSplitted: Array.isArray(analyticsData.topCTAsSplitted) ? analyticsData.topCTAsSplitted : [],
          topCTAsAggregated: Array.isArray(analyticsData.topCTAsAggregated) ? analyticsData.topCTAsAggregated : [],
          topFAQs: Array.isArray(analyticsData.topFAQs) ? analyticsData.topFAQs : [],
          topLocations: Array.isArray(analyticsData.topLocations) ? analyticsData.topLocations : [],
          topCountries: Array.isArray(analyticsData.topCountries) ? analyticsData.topCountries : [],
          topCountriesBySessionStart: Array.isArray(analyticsData.topCountriesBySessionStart) ? analyticsData.topCountriesBySessionStart : [],
          topCountriesByPageView: Array.isArray(analyticsData.topCountriesByPageView) ? analyticsData.topCountriesByPageView : [],
          topCountriesByCTAClick: Array.isArray(analyticsData.topCountriesByCTAClick) ? analyticsData.topCountriesByCTAClick : [],
          topCountriesByVideoClick: Array.isArray(analyticsData.topCountriesByVideoClick) ? analyticsData.topCountriesByVideoClick : [],
          topCountriesByFAQClick: Array.isArray(analyticsData.topCountriesByFAQClick) ? analyticsData.topCountriesByFAQClick : [],
        };
        
        setData(processedData);
      } catch (err) {
        console.error("Error fetching analytics data:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [scope]);

  if (loading) {
    return (
      <PageSkeleton
        title="Analytics"
        description="View your site analytics and performance metrics."
        rightSideContent={<DashboardTimeScope />}
        variant="analytics"
      />
    );
  }

  if (error || !data) {
    return (
      <>
        <AdminPageTitle
          title="Analytics"
          description="View your site analytics and performance metrics."
          rightSideContent={<DashboardTimeScope />}
        />
        <div className="text-center py-12">
          <p className="text-destructive">{error || "Failed to load analytics"}</p>
        </div>
      </>
    );
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


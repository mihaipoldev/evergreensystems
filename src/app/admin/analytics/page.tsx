"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AdminPageTitle } from "@/components/admin/AdminPageTitle";
import { AnalyticsDashboard } from "@/components/admin/AnalyticsDashboard";
import { DashboardTimeScope } from "@/components/admin/DashboardTimeScope";

type AnalyticsData = {
  totalPageViews: number;
  totalCTAClicks: number;
  totalVideoClicks: number;
  totalSessionStarts: number;
  uniqueSessions: number;
  pageViewsSeries: Array<{ date: string; count: number }>;
  ctaClicksSeries: Array<{ date: string; count: number }>;
  sessionStartsSeries: Array<{ date: string; count: number }>;
  videoClicksSeries: Array<{ date: string; count: number }>;
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

export default function AnalyticsPage() {
  const searchParams = useSearchParams();
  const [data, setData] = useState<AnalyticsData>(defaultData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalyticsData() {
      try {
        const scope = searchParams.get("scope") || "30";
        const response = await fetch(`/api/admin/analytics/stats?scope=${scope}`);
        if (!response.ok) {
          throw new Error("Failed to fetch analytics data");
        }
        const analyticsData = await response.json();
        setData(analyticsData);
      } catch (error) {
        console.error("Error fetching analytics data:", error);
        setData(defaultData);
      } finally {
        setLoading(false);
      }
    }

    fetchAnalyticsData();
  }, [searchParams]);

  if (loading) {
    return (
      <>
        <AdminPageTitle
          title="Analytics"
          description="View your site analytics and performance metrics."
        />
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">Loading analytics...</p>
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

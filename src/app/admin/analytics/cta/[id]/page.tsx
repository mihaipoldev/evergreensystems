"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useParams } from "next/navigation";
import { AdminPageTitle } from "@/components/admin/AdminPageTitle";
import { CTAAnalyticsDashboard } from "@/components/admin/CTAAnalyticsDashboard";
import { DashboardTimeScope } from "@/components/admin/DashboardTimeScope";

type CTAAnalyticsData = {
  totalCTAClicks: number;
  ctaClicksSeries: Array<{ date: string; count: number }>;
  topLocations: Array<{
    location: string;
    clicks: number;
  }>;
  topCountries: Array<{
    country: string;
    count: number;
  }>;
};

const defaultData: CTAAnalyticsData = {
  totalCTAClicks: 0,
  ctaClicksSeries: [],
  topLocations: [],
  topCountries: [],
};

function CTAAnalyticsContent() {
  const searchParams = useSearchParams();
  const params = useParams();
  const ctaId = params.id as string;
  const [data, setData] = useState<CTAAnalyticsData>(defaultData);
  const [loading, setLoading] = useState(true);
  const [ctaLabel, setCtaLabel] = useState<string>("CTA Analytics");

  useEffect(() => {
    async function fetchData() {
      try {
        const scope = searchParams.get("scope") || "30";
        
        // Fetch CTA label
        const ctaResponse = await fetch(`/api/admin/cta-buttons/${ctaId}`);
        if (ctaResponse.ok) {
          const ctaData = await ctaResponse.json();
          setCtaLabel(ctaData.label || "CTA Analytics");
        }

        // Fetch analytics data
        const analyticsResponse = await fetch(`/api/admin/analytics/cta/${ctaId}?scope=${scope}`);
        if (!analyticsResponse.ok) {
          const errorData = await analyticsResponse.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to fetch analytics data");
        }
        const analyticsData = await analyticsResponse.json();
        
        // Check if response has error field
        if (analyticsData.error) {
          console.error("API Error:", analyticsData.error);
          throw new Error(analyticsData.error);
        }
        
        // Ensure we have valid data structure
        const processedData: CTAAnalyticsData = {
          totalCTAClicks: analyticsData.totalCTAClicks || 0,
          ctaClicksSeries: Array.isArray(analyticsData.ctaClicksSeries) ? analyticsData.ctaClicksSeries : [],
          topLocations: Array.isArray(analyticsData.topLocations) ? analyticsData.topLocations : [],
          topCountries: Array.isArray(analyticsData.topCountries) ? analyticsData.topCountries : [],
        };
        
        setData(processedData);
      } catch (error) {
        console.error("Error fetching data:", error);
        setData(defaultData);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [searchParams, ctaId]);

  if (loading) {
    return (
      <>
        <AdminPageTitle
          title={ctaLabel}
          description="View CTA analytics and performance metrics."
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
        title={ctaLabel}
        description="View CTA analytics and performance metrics."
        rightSideContent={<DashboardTimeScope />}
      />
      <CTAAnalyticsDashboard data={data} />
    </>
  );
}

export default function CTAAnalyticsPage() {
  return (
    <Suspense
      fallback={
        <>
          <AdminPageTitle
            title="CTA Analytics"
            description="View CTA analytics and performance metrics."
          />
          <div className="flex items-center justify-center min-h-[400px]">
            <p className="text-muted-foreground">Loading analytics...</p>
          </div>
        </>
      }
    >
      <CTAAnalyticsContent />
    </Suspense>
  );
}

"use client";

import { useState, useEffect, useRef } from "react";
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

// Helper to get scope from localStorage (same logic as DashboardTimeScope)
function getStoredScope(): string {
  if (typeof window === "undefined") return "30";
  const stored = localStorage.getItem("admin-analytics-scope");
  if (stored && ["1", "7", "30", "90", "365", "all"].includes(stored)) {
    return stored;
  }
  return "30";
}

export function AnalyticsContent() {
  const searchParams = useSearchParams();
  const urlScope = searchParams.get("scope");
  
  // Use URL scope if available, otherwise localStorage, otherwise default
  // This prevents re-fetching when URL syncs to the same value
  const [scope, setScope] = useState<string>(() => {
    return urlScope || getStoredScope();
  });
  
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isInitialLoadRef = useRef(true);
  const lastFetchedScopeRef = useRef<string | null>(null);
  
  // Update scope only when URL scope actually changes (not just when searchParams object changes)
  useEffect(() => {
    const newScope = urlScope || getStoredScope();
    if (newScope !== scope) {
      setScope(newScope);
    }
  }, [urlScope, scope]);

  // Ensure preset-admin class is applied immediately
  // This is needed for dynamically imported components
  useEffect(() => {
    if (typeof document !== "undefined") {
      // Ensure preset-admin class is on html
      if (!document.documentElement.classList.contains("preset-admin")) {
        document.documentElement.classList.add("preset-admin");
      }
      
      // Ensure font CSS variable is set immediately (CSS should handle this, but double-check)
      const root = document.documentElement;
      const computedStyle = getComputedStyle(root);
      const fontVar = computedStyle.getPropertyValue("--font-geist-sans").trim();
      
      if (!fontVar) {
        // Set fallback font variable immediately
        root.style.setProperty("--font-geist-sans", "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif", "important");
      }
    }
  }, []);

  useEffect(() => {
    // Check if we've already fetched this exact scope (prevent duplicate fetches)
    if (lastFetchedScopeRef.current === scope) {
      return;
    }

    // Check if this is a scope change (not initial load)
    const wasInitialLoad = isInitialLoadRef.current;

    // Mark that we're fetching this scope BEFORE the async operation
    // This prevents duplicate fetches if the effect runs again before fetch completes
    lastFetchedScopeRef.current = scope;

    async function fetchData() {
      try {
        // Only show loading skeleton on initial load, not on scope changes
        if (wasInitialLoad) {
          setLoading(true);
        }
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
        // Mark initial load as complete after first successful fetch
        if (wasInitialLoad) {
          isInitialLoadRef.current = false;
        }
      } catch (err) {
        console.error("Error fetching analytics data:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
        // Mark initial load as complete even on error
        if (wasInitialLoad) {
          isInitialLoadRef.current = false;
        }
        // Reset the ref on error so we can retry
        lastFetchedScopeRef.current = null;
      } finally {
        setLoading(false);
      }
    }

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope]);

  // Only show full skeleton on initial load, not on scope changes
  if (loading && isInitialLoadRef.current) {
    return (
      <PageSkeleton
        title="Analytics"
        rightSideContent={<DashboardTimeScope />}
        variant="analytics"
      />
    );
  }

  if (error || !data) {
    return (
      <div className="w-full space-y-6">
        <div className="">
          <AdminPageTitle
            title="Analytics"
            rightSideContent={<DashboardTimeScope />}
          />
        </div>
        <div className="text-center py-12">
          <p className="text-destructive">{error || "Failed to load analytics"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="">
        <AdminPageTitle
          title="Analytics"
          rightSideContent={<DashboardTimeScope />}
        />
      </div>
      <AnalyticsDashboard data={data} />
    </div>
  );
}


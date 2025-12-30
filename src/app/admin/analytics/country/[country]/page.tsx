"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
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

export default function CountryAnalyticsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const country = params.country as string;
  const scope = searchParams.get("scope") || "30";
  
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
  
  // Decode country name/code from URL
  const decodedCountry = decodeURIComponent(country);
  
        // Normalize country: Convert country name to code if needed, or use as-is if it's already a code
  const countryCode = countryNameToCode[decodedCountry] || decodedCountry.toUpperCase();
  
        const response = await fetch(`/api/admin/analytics/stats?scope=${scope}&country=${encodeURIComponent(countryCode)}`);
        
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
          topCities: Array.isArray(analyticsData.topCities) ? analyticsData.topCities : [],
          topCitiesBySessionStart: Array.isArray(analyticsData.topCitiesBySessionStart) ? analyticsData.topCitiesBySessionStart : [],
          topCitiesByPageView: Array.isArray(analyticsData.topCitiesByPageView) ? analyticsData.topCitiesByPageView : [],
          topCitiesByCTAClick: Array.isArray(analyticsData.topCitiesByCTAClick) ? analyticsData.topCitiesByCTAClick : [],
          topCitiesByVideoClick: Array.isArray(analyticsData.topCitiesByVideoClick) ? analyticsData.topCitiesByVideoClick : [],
        };
        
        setData(processedData);
      } catch (err) {
        console.error("Error fetching country analytics data:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    if (country) {
      fetchData();
    }
  }, [country, scope]);

  if (!country) {
    return (
      <>
        <AdminPageTitle
          title="Analytics"
          description="View your site analytics and performance metrics."
        />
        <div className="text-center py-12">
          <p className="text-muted-foreground">Country parameter is required</p>
        </div>
      </>
    );
  }

  // Decode and get country code for display
  const decodedCountry = decodeURIComponent(country);
  const countryCode = countryNameToCode[decodedCountry] || decodedCountry.toUpperCase();
  const countryDisplayName = getCountryDisplayName(countryCode);

  if (loading) {
    return (
      <PageSkeleton
        title={countryDisplayName}
        description={`View analytics and performance metrics for ${countryDisplayName}.`}
        rightSideContent={<DashboardTimeScope />}
        variant="analytics"
      />
    );
  }

  if (error || !data) {
    return (
      <>
        <AdminPageTitle
          title={countryDisplayName}
          description={`View analytics and performance metrics for ${countryDisplayName}.`}
          rightSideContent={<DashboardTimeScope />}
          icon={<span className="text-3xl leading-none">{getFlagEmoji(countryDisplayName)}</span>}
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
        title={countryDisplayName}
        description={`View analytics and performance metrics for ${countryDisplayName}.`}
        rightSideContent={<DashboardTimeScope />}
        icon={<span className="text-3xl leading-none">{getFlagEmoji(countryDisplayName)}</span>}
      />
      <AnalyticsDashboard data={data} />
    </>
  );
}

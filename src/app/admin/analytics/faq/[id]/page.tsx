"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useParams } from "next/navigation";
import { AdminPageTitle } from "@/components/admin/AdminPageTitle";
import { FAQAnalyticsDashboard } from "@/components/admin/FAQAnalyticsDashboard";
import { DashboardTimeScope } from "@/components/admin/DashboardTimeScope";

type FAQAnalyticsData = {
  totalFAQClicks: number;
  faqClicksSeries: Array<{ date: string; count: number }>;
  topCountries: Array<{
    country: string;
    count: number;
  }>;
};

const defaultData: FAQAnalyticsData = {
  totalFAQClicks: 0,
  faqClicksSeries: [],
  topCountries: [],
};

function FAQAnalyticsContent() {
  const searchParams = useSearchParams();
  const params = useParams();
  const faqId = params.id as string;
  const [data, setData] = useState<FAQAnalyticsData>(defaultData);
  const [loading, setLoading] = useState(true);
  const [faqQuestion, setFaqQuestion] = useState<string>("FAQ Analytics");

  useEffect(() => {
    async function fetchData() {
      try {
        const scope = searchParams.get("scope") || "30";
        
        // Fetch FAQ question
        const faqResponse = await fetch(`/api/admin/faq-items/${faqId}`);
        if (faqResponse.ok) {
          const faqData = await faqResponse.json();
          setFaqQuestion(faqData.question || "FAQ Analytics");
        }

        // Fetch analytics data
        const analyticsResponse = await fetch(`/api/admin/analytics/faq/${faqId}?scope=${scope}`);
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
        const processedData: FAQAnalyticsData = {
          totalFAQClicks: analyticsData.totalFAQClicks || 0,
          faqClicksSeries: Array.isArray(analyticsData.faqClicksSeries) ? analyticsData.faqClicksSeries : [],
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
  }, [searchParams, faqId]);

  if (loading) {
    return (
      <>
        <AdminPageTitle
          title={faqQuestion}
          description="View FAQ analytics and performance metrics."
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
        title={faqQuestion}
        description="View FAQ analytics and performance metrics."
        rightSideContent={<DashboardTimeScope />}
      />
      <FAQAnalyticsDashboard data={data} />
    </>
  );
}

export default function FAQAnalyticsPage() {
  return (
    <Suspense
      fallback={
        <>
          <AdminPageTitle
            title="FAQ Analytics"
            description="View FAQ analytics and performance metrics."
          />
          <div className="flex items-center justify-center min-h-[400px]">
            <p className="text-muted-foreground">Loading analytics...</p>
          </div>
        </>
      }
    >
      <FAQAnalyticsContent />
    </Suspense>
  );
}

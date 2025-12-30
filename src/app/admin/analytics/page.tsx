"use client";

import dynamic from "next/dynamic";
import { PageSkeleton } from "@/components/admin/ui/PageSkeleton";
import { DashboardTimeScope } from "@/features/analytics/components/DashboardTimeScope";

// Dynamically import the analytics content with SSR disabled
// This ensures the page is truly client-side only
const AnalyticsContent = dynamic(
  () => import("./AnalyticsContent").then((mod) => ({ default: mod.AnalyticsContent })),
  {
    ssr: false,
    loading: () => (
      <PageSkeleton
        title="Analytics"
        description="View your site analytics and performance metrics."
        rightSideContent={<DashboardTimeScope />}
        variant="analytics"
      />
    ),
  }
);

export default function AnalyticsPage() {
  return <AnalyticsContent />;
}

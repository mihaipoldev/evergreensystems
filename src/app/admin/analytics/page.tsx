"use client";

import dynamic from "next/dynamic";
import Script from "next/script";
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
  return (
    <>
      {/* Critical: Set font CSS variable immediately for analytics page */}
      {/* This runs before the page renders to prevent Times font flash */}
      <Script
        id="analytics-font-fix"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function() {
              // Set font CSS variable immediately before page renders
              // This prevents Times font flash on analytics page
              if (typeof document !== 'undefined' && document.documentElement) {
                const root = document.documentElement;
                // Always ensure the CSS variable is set (CSS should handle this, but this is a backup)
                // Use inline style with important to ensure it takes precedence
                root.style.setProperty('--font-geist-sans', "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif", 'important');
                // Ensure preset-admin class is set
                if (!root.classList.contains('preset-admin')) {
                  root.classList.add('preset-admin');
                }
              }
            })();
          `,
        }}
      />
      <AnalyticsContent />
    </>
  );
}

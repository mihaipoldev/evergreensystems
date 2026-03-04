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
        rightSideContent={<DashboardTimeScope />}
        variant="analytics"
      />
    ),
  }
);

export default function AnalyticsPage() {
  return (
    <div>
      {/* Critical: Set font CSS variable immediately for analytics page */}
      {/* This runs before the page renders to prevent Times font flash */}
      <Script
        id="analytics-font-fix"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function() {
              if (typeof document !== 'undefined' && document.documentElement) {
                var root = document.documentElement;
                root.style.setProperty('--font-geist-sans', "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif", 'important');
                if (!root.classList.contains('preset-admin')) {
                  root.classList.add('preset-admin');
                }
              }
            })();
          `,
        }}
      />
      <AnalyticsContent />
    </div>
  );
}

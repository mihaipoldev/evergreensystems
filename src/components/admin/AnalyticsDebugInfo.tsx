"use client";

import * as React from "react";

type AnalyticsDebugInfoProps = {
  data: {
    totalPageViews: number;
    totalCTAClicks: number;
    totalVideoClicks: number;
    totalFAQClicks: number;
    totalSessionStarts: number;
  };
  queryInfo?: {
    timestamp?: string;
    totalEventsFetched?: number;
    eventsAfterDateFilter?: number;
    pageViews?: number;
    ctaClicks?: number;
  };
};

export function AnalyticsDebugInfo({ data, queryInfo }: AnalyticsDebugInfoProps) {
  const [isVisible, setIsVisible] = React.useState(false);

  if (process.env.NODE_ENV !== 'development') {
    return null; // Only show in development
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="bg-red-500 text-white px-3 py-2 rounded text-xs font-bold"
      >
        {isVisible ? 'Hide' : 'Show'} Debug
      </button>
      {isVisible && (
        <div className="mt-2 bg-black/90 text-white p-4 rounded text-xs font-mono max-w-md overflow-auto max-h-96">
          <div className="font-bold mb-2">Analytics Debug Info</div>
          <div className="space-y-1">
            <div><strong>Timestamp:</strong> {new Date().toISOString()}</div>
            <div><strong>Page Views:</strong> {data.totalPageViews}</div>
            <div><strong>CTA Clicks:</strong> {data.totalCTAClicks}</div>
            <div><strong>Video Clicks:</strong> {data.totalVideoClicks}</div>
            <div><strong>FAQ Clicks:</strong> {data.totalFAQClicks}</div>
            <div><strong>Session Starts:</strong> {data.totalSessionStarts}</div>
            {queryInfo && (
              <>
                <div className="border-t border-white/20 mt-2 pt-2">
                  <div><strong>Query Timestamp:</strong> {queryInfo.timestamp}</div>
                  <div><strong>Events Fetched:</strong> {queryInfo.totalEventsFetched}</div>
                  <div><strong>Events After Filter:</strong> {queryInfo.eventsAfterDateFilter}</div>
                  <div><strong>Page Views (from query):</strong> {queryInfo.pageViews}</div>
                  <div><strong>CTA Clicks (from query):</strong> {queryInfo.ctaClicks}</div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

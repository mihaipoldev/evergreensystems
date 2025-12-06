"use client";

import { useEffect } from "react";
import { trackEvent, trackSessionStart } from "@/lib/analytics";

interface AnalyticsTrackerProps {
  pageId: string;
  pageSlug: string;
}

export function AnalyticsTracker({ pageId, pageSlug }: AnalyticsTrackerProps) {
  useEffect(() => {
    // Track session start (only once per session)
    trackSessionStart();

    // Track page view
    trackEvent({
      event_type: "page_view",
      entity_type: "page",
      entity_id: pageSlug || pageId,
      metadata: {
        pathname: window.location.pathname,
        search: window.location.search,
      },
    });
  }, [pageId, pageSlug]);

  return null;
}

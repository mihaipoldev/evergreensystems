"use client";

import { useEffect, useRef } from "react";
import { trackEvent, trackSessionStart, getOrCreateSessionId } from "@/lib/analytics";

interface AnalyticsTrackerProps {
  pageId: string;
  pageSlug: string;
}

export function AnalyticsTracker({ pageId, pageSlug }: AnalyticsTrackerProps) {
  const fired = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    getOrCreateSessionId();

    function fire() {
      if (fired.current) return;
      fired.current = true;
      cleanup();
      trackSessionStart();
      trackEvent({
        event_type: "page_view",
        entity_type: "page",
        entity_id: pageSlug || pageId,
        metadata: {
          pathname: window.location.pathname,
          search: window.location.search,
        },
      });
    }

    const timer = setTimeout(fire, 3000);

    let baseScrollY: number | null = null;
    function onScroll() {
      if (baseScrollY === null) baseScrollY = window.scrollY;
      if (Math.abs(window.scrollY - baseScrollY) > 100) fire();
    }

    function onInteract() {
      fire();
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("click", onInteract);
    document.addEventListener("keydown", onInteract);

    function cleanup() {
      clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("click", onInteract);
      document.removeEventListener("keydown", onInteract);
    }

    return cleanup;
  }, [pageId, pageSlug]);

  return null;
}

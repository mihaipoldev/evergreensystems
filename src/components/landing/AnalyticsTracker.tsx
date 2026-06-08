"use client";

import { useEffect, useRef, useState } from "react";
import {
  trackEvent,
  trackSessionStart,
  getOrCreateSessionId,
  applyAnalyticsToggleFromUrl,
  getAnalyticsMode,
  type AnalyticsMode,
} from "@/lib/analytics";
import { AnalyticsToggleBadge } from "./AnalyticsToggleBadge";

interface AnalyticsTrackerProps {
  pageId: string;
  pageSlug: string;
}

export function AnalyticsTracker({ pageId, pageSlug }: AnalyticsTrackerProps) {
  const fired = useRef(false);
  const [badge, setBadge] = useState<{ mode: AnalyticsMode; flash: boolean } | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Apply ?analytics=on|off|default BEFORE any event fires, so the opt-out
    // flag is in effect for this page load.
    const applied = applyAnalyticsToggleFromUrl();
    setBadge({ mode: getAnalyticsMode(), flash: applied !== null });

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

  if (!badge) return null;
  return <AnalyticsToggleBadge mode={badge.mode} flash={badge.flash} />;
}

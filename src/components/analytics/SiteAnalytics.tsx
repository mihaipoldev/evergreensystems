"use client";

import { useEffect, useState } from "react";
import {
  trackEvent,
  trackEventBeacon,
  trackSessionStart,
  getOrCreateSessionId,
  captureUtmFromUrl,
  applyAnalyticsToggleFromUrl,
  getAnalyticsMode,
  type AnalyticsMode,
  type EntityType,
} from "@/lib/analytics";
import { initFormTracking } from "@/lib/form-tracking";
import { AnalyticsToggleBadge } from "@/components/landing/AnalyticsToggleBadge";

// ── SiteAnalytics ───────────────────────────────────────────────────────────
// The single per-page tracker for the landing page and funnel pages. Replaces
// the old AnalyticsTracker (which only fired a deferred page_view) and adds:
//
//   • session_start + page_view on mount (bounces become visible)
//   • a delegated click tracker — EVERY <a>/<button> click is captured and
//     classified; nothing clickable is ever silently untracked again
//   • section_view via IntersectionObserver (entity ids = section slugs)
//   • impression events for CTAs/niche cards (the CTR denominator)
//   • scroll-depth milestones (25/50/75/100)
//   • a page_engagement summary beacon on first tab-hide/leave
//     (engaged_seconds, max_scroll_pct, clicks — the dead-session detector)
//   • form_start / form_abandon for forms tagged data-analytics-form
//     (behavior only, never field values — see src/lib/form-tracking.ts)
//
// Element contract (data attributes):
//   data-analytics-skip      — element manages its own tracking; the delegated
//                              click tracker ignores it (still counts toward
//                              the engagement click total)
//   data-analytics-type      — explicit EntityType (cta_button, niche_card, …);
//                              cta_button/niche_card also get impressions
//   data-analytics-id        — explicit entity_id (else derived: section-label)
//   data-analytics-label     — explicit label (else aria-label/textContent)
//   data-analytics-section   — section slug on a container (else section[id],
//                              header → nav, footer → footer)

interface SiteAnalyticsProps {
  /** Analytics slug for this page, e.g. "home" or "recruiting-agencies". */
  pageSlug: string;
}

const SCROLL_MILESTONES = [25, 50, 75, 100] as const;
const SOCIAL_HREF =
  /linkedin\.com|instagram\.com|twitter\.com|x\.com\/|facebook\.com|youtube\.com|^mailto:/i;

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

/** Resolve the section slug an element belongs to. */
function sectionOf(el: Element): string {
  const host = el.closest<HTMLElement>(
    "[data-analytics-section], section[id], header, footer",
  );
  if (!host) return "page";
  if (host.dataset.analyticsSection) return host.dataset.analyticsSection;
  if (host.id) return host.id;
  return host.tagName === "HEADER" ? "nav" : "footer";
}

function labelOf(el: HTMLElement): string {
  return (
    el.dataset.analyticsLabel ||
    el.getAttribute("aria-label") ||
    (el.textContent || "").trim().replace(/\s+/g, " ").slice(0, 80) ||
    el.tagName.toLowerCase()
  );
}

interface ClassifiedClick {
  entityType: EntityType;
  entityId: string;
  label: string;
  href: string | null;
  section: string;
}

/** Classify a click target into the link_click taxonomy, or null to ignore. */
function classifyClick(target: Element): ClassifiedClick | null {
  const el = target.closest<HTMLElement>("a, button");
  if (!el) return null;
  // Element (or wrapper) manages its own tracking — don't double-fire.
  if (el.closest("[data-analytics-skip]")) return null;

  const href = el.getAttribute("href");
  const section = sectionOf(el);
  const label = labelOf(el);

  const explicitType = el.dataset.analyticsType as EntityType | undefined;
  let entityType: EntityType;
  if (explicitType) {
    entityType = explicitType;
  } else if (href && SOCIAL_HREF.test(href)) {
    entityType = "social_link";
  } else if (el.closest("footer")) {
    entityType = "footer_link";
  } else if (el.closest("header, nav")) {
    entityType = "nav_link";
  } else if (href) {
    entityType = "inline_link";
  } else {
    entityType = "ui_element";
  }

  const entityId = el.dataset.analyticsId || `${section}-${slugify(label)}`;
  return { entityType, entityId, label, href, section };
}

export function SiteAnalytics({ pageSlug }: SiteAnalyticsProps) {
  const [badge, setBadge] = useState<{ mode: AnalyticsMode; flash: boolean } | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Apply ?analytics=on|off|default BEFORE any event fires, so the opt-out
    // flag is in effect for this page load.
    const applied = applyAnalyticsToggleFromUrl();
    setBadge({ mode: getAnalyticsMode(), flash: applied !== null });

    getOrCreateSessionId();
    // Capture campaign attribution from the landing URL before any event fires —
    // every event after this carries the UTM keys in its metadata.
    captureUtmFromUrl();

    const pathname = window.location.pathname;

    // ── page_view on mount — real bounces become visible ──────────────────
    trackSessionStart();
    trackEvent({
      event_type: "page_view",
      entity_type: "page",
      entity_id: pageSlug,
      metadata: { pathname, search: window.location.search },
    });

    // ── Engagement accumulators (reported by the final beacon) ────────────
    let clickCount = 0;
    let maxScrollPct = 0;
    let engagedMs = 0;
    let visibleSince: number | null =
      document.visibilityState === "visible" ? Date.now() : null;
    let engagementSent = false;

    // ── Delegated click tracking (capture phase — sees clicks before
    //    navigation; trackEvent uses keepalive for link_click) ─────────────
    function onClick(event: MouseEvent) {
      clickCount += 1;
      const target = event.target;
      if (!(target instanceof Element)) return;
      const click = classifyClick(target);
      if (!click) return;
      trackEvent({
        event_type: "link_click",
        entity_type: click.entityType,
        entity_id: click.entityId,
        metadata: {
          label: click.label,
          href: click.href,
          section: click.section,
          page: pageSlug,
        },
      });
    }
    document.addEventListener("click", onClick, { capture: true });

    // ── section_view — once per section per page view ──────────────────────
    // Multiple low thresholds so sections taller than the viewport still
    // qualify via the "fills half the screen" condition (their ratio can
    // never reach 0.4).
    const seenSections = new Set<string>();
    // a/button can carry data-analytics-section as a click-context override —
    // they are never themselves sections.
    const sectionEls = document.querySelectorAll<HTMLElement>(
      "[data-analytics-section]:not(a):not(button), section[id]",
    );
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const visibleEnough =
            entry.intersectionRatio >= 0.4 ||
            entry.intersectionRect.height >= window.innerHeight * 0.5;
          if (!visibleEnough) continue;
          const host = entry.target as HTMLElement;
          const slug = host.dataset.analyticsSection || host.id;
          if (!slug || seenSections.has(slug)) continue;
          seenSections.add(slug);
          trackEvent({
            event_type: "section_view",
            entity_type: "site_section",
            entity_id: slug,
            metadata: { page: pageSlug },
          });
          sectionObserver.unobserve(host);
        }
      },
      { threshold: [0, 0.15, 0.3, 0.45] },
    );
    sectionEls.forEach((el) => sectionObserver.observe(el));

    // ── impressions — CTA / niche-card / FAQ visibility, the CTR denominator ─
    const seenImpressions = new Set<string>();
    const impressionEls = document.querySelectorAll<HTMLElement>(
      '[data-analytics-type="cta_button"], [data-analytics-type="niche_card"], [data-analytics-type="faq_item"]',
    );
    const impressionObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting || entry.intersectionRatio < 0.6) continue;
          const el = entry.target as HTMLElement;
          const entityType = el.dataset.analyticsType as EntityType;
          const label = labelOf(el);
          const entityId =
            el.dataset.analyticsId || `${sectionOf(el)}-${slugify(label)}`;
          if (seenImpressions.has(entityId)) continue;
          seenImpressions.add(entityId);
          trackEvent({
            event_type: "impression",
            entity_type: entityType,
            entity_id: entityId,
            metadata: { label, section: sectionOf(el), page: pageSlug },
          });
          impressionObserver.unobserve(el);
        }
      },
      { threshold: 0.6 },
    );
    impressionEls.forEach((el) => impressionObserver.observe(el));

    // ── scroll depth — 25/50/75/100, once each per page view ──────────────
    const firedDepths = new Set<number>();
    function scrollPct(): number {
      const scrollable =
        document.documentElement.scrollHeight - window.innerHeight;
      if (scrollable <= 0) return 100;
      return Math.min(100, Math.round((window.scrollY / scrollable) * 100));
    }
    function onScroll() {
      const pct = scrollPct();
      if (pct > maxScrollPct) maxScrollPct = pct;
      for (const milestone of SCROLL_MILESTONES) {
        if (pct >= milestone && !firedDepths.has(milestone)) {
          firedDepths.add(milestone);
          trackEvent({
            event_type: "scroll_depth",
            entity_type: "page",
            entity_id: pageSlug,
            metadata: { depth: milestone, pathname },
          });
        }
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll(); // short pages count as fully seen

    // ── page_engagement — one summary beacon on first tab-hide/leave ──────
    function sendEngagement() {
      if (engagementSent) return;
      engagementSent = true;
      if (visibleSince !== null) {
        engagedMs += Date.now() - visibleSince;
        visibleSince = null;
      }
      trackEventBeacon({
        event_type: "page_engagement",
        entity_type: "page",
        entity_id: pageSlug,
        metadata: {
          engaged_seconds: Math.round(engagedMs / 1000),
          max_scroll_pct: maxScrollPct,
          clicks: clickCount,
          pathname,
        },
      });
    }
    function onVisibilityChange() {
      if (document.visibilityState === "hidden") {
        sendEngagement();
      } else if (visibleSince === null && !engagementSent) {
        visibleSince = Date.now();
      }
    }
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("pagehide", sendEngagement);

    // ── form_start / form_abandon for tagged forms (behavior only) ────────
    const cleanupFormTracking = initFormTracking(pageSlug);

    return () => {
      document.removeEventListener("click", onClick, { capture: true });
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("pagehide", sendEngagement);
      sectionObserver.disconnect();
      impressionObserver.disconnect();
      cleanupFormTracking();
    };
  }, [pageSlug]);

  if (!badge) return null;
  return <AnalyticsToggleBadge mode={badge.mode} flash={badge.flash} />;
}

"use client";

/**
 * Analytics utility for tracking user events
 * Handles session management and event tracking
 */

const SESSION_COOKIE_NAME = "analytics_session_id";
const SESSION_DURATION = 30 * 60; // 30 minutes in seconds

export type EventType =
  | "page_view"
  | "link_click"
  | "section_view"
  | "session_start"
  | "impression"
  | "scroll_depth"
  | "page_engagement";
export type EntityType =
  | "cta_button"
  | "site_section"
  | "page"
  | "testimonial"
  | "faq_item"
  | "media"
  | "nav_link"
  | "niche_card"
  | "social_link"
  | "footer_link"
  | "inline_link"
  | "ui_element";

/**
 * Check if we're in development/localhost mode
 * Prevents analytics events from being tracked during development
 */
function isDevelopment(): boolean {
  // Check NODE_ENV first (most reliable)
  if (process.env.NODE_ENV === 'development') {
    return true;
  }

  // Also check hostname as a fallback (in case NODE_ENV isn't set correctly)
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    return (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '0.0.0.0' ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('10.0.')
    );
  }

  return false;
}

// ── Per-browser analytics toggle ──────────────────────────────────────────
// A localStorage mode flag lets a specific browser opt out of (or force on)
// tracking, without affecting anyone else. Flipped via `?analytics=on|off|default`
// (see applyAnalyticsToggleFromUrl). Replaces the old build-time debug env flag.
export const ANALYTICS_MODE_KEY = "eg_analytics_mode";
export type AnalyticsMode = "on" | "off" | "default";

export function getAnalyticsMode(): AnalyticsMode {
  if (typeof window === "undefined") return "default";
  try {
    const v = window.localStorage.getItem(ANALYTICS_MODE_KEY);
    return v === "on" || v === "off" ? v : "default";
  } catch {
    return "default";
  }
}

export function setAnalyticsMode(mode: AnalyticsMode): void {
  if (typeof window === "undefined") return;
  try {
    if (mode === "default") window.localStorage.removeItem(ANALYTICS_MODE_KEY);
    else window.localStorage.setItem(ANALYTICS_MODE_KEY, mode);
  } catch {
    // localStorage unavailable (private mode) — nothing we can do
  }
}

/**
 * Reads `?analytics=on|off|default` (also accepts reset/clear), applies it to the
 * per-browser flag, strips the param from the address bar, and returns the applied
 * mode (or null if the param was absent). Safe to call on every mount.
 */
export function applyAnalyticsToggleFromUrl(): AnalyticsMode | null {
  if (typeof window === "undefined") return null;
  let raw: string | null = null;
  try {
    raw = new URLSearchParams(window.location.search).get("analytics");
  } catch {
    return null;
  }
  if (raw === null) return null;

  const v = raw.toLowerCase();
  const mode: AnalyticsMode =
    v === "on" ? "on" : v === "off" ? "off" : "default"; // default/reset/clear/anything → default
  setAnalyticsMode(mode);

  // strip the param so it doesn't linger / get shared
  try {
    const url = new URL(window.location.href);
    url.searchParams.delete("analytics");
    window.history.replaceState({}, "", url.pathname + url.search + url.hash);
  } catch {
    // ignore
  }
  return mode;
}

/**
 * Whether to skip sending an event for this browser:
 *   mode "off" → always skip · mode "on" → always send (even in dev) · else → dev gate.
 */
function shouldSkipTracking(): boolean {
  const mode = getAnalyticsMode();
  if (mode === "off") return true;
  if (mode === "on") return false;
  return isDevelopment();
}

// ── Campaign attribution (UTM) ─────────────────────────────────────────────
// First-touch per session: parsed once from the landing URL, kept in
// sessionStorage, and merged into every event's metadata so the dashboard can
// slice any metric by campaign without session joins. Per-campaign only —
// never per-person (no lead ids, no emails).
const UTM_STORAGE_KEY = "eg_utm";
const UTM_PARAMS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "gclid",
  "fbclid",
] as const;

export function captureUtmFromUrl(): void {
  if (typeof window === "undefined") return;
  try {
    const params = new URLSearchParams(window.location.search);
    const utm: Record<string, string> = {};
    for (const key of UTM_PARAMS) {
      const value = params.get(key);
      if (value) utm[key] = value.slice(0, 200);
    }
    if (Object.keys(utm).length > 0) {
      window.sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(utm));
    }
  } catch {
    // sessionStorage unavailable — attribution degrades gracefully
  }
}

export function getStoredUtm(): Record<string, string> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(UTM_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export interface TrackEventParams {
  event_type: EventType;
  entity_type: EntityType;
  entity_id: string;
  metadata?: Record<string, any> | null;
}

/**
 * Get or create a session ID
 * Session ID is stored in a cookie and persists for 30 minutes
 */
export function getOrCreateSessionId(): string {
  if (typeof window === "undefined") {
    return "";
  }

  // Try to get existing session ID from cookie
  const cookies = document.cookie.split(";");
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split("=");
    if (name === SESSION_COOKIE_NAME && value) {
      return decodeURIComponent(value);
    }
  }

  // Generate new session ID with fallback for older browsers
  let sessionId: string;
  try {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      sessionId = crypto.randomUUID();
    } else {
      // Fallback for older browsers (iOS < 15.4)
      sessionId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    }
  } catch (e) {
    // Ultimate fallback if crypto fails
    sessionId = Date.now().toString(36) + Math.random().toString(36).substring(2);
  }

  // Store in cookie with 30-minute expiration
  const expires = new Date();
  expires.setTime(expires.getTime() + SESSION_DURATION * 1000);
  document.cookie = `${SESSION_COOKIE_NAME}=${encodeURIComponent(sessionId)}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;

  return sessionId;
}

/**
 * Assemble the POST payload shared by trackEvent (fetch) and trackEventBeacon
 * (sendBeacon): session id, browser context, stored UTM, and the debug tag.
 */
function buildPayload(params: TrackEventParams) {
  const sessionId = getOrCreateSessionId();

  // Get user agent and referrer from browser
  const userAgent = navigator.userAgent || null;
  const referrer = document.referrer || null;

  // Stored campaign attribution rides along on every event; the event's own
  // metadata keys win on collision.
  const utm = getStoredUtm();
  let metadata: Record<string, any> | null = params.metadata || null;
  if (utm) metadata = { ...utm, ...(metadata || {}) };

  // In debug mode, tag events so dev/test rows are trivially filterable/deletable
  // (DELETE FROM analytics_events WHERE metadata->>'debug' = 'true').
  const debugMode = process.env.NEXT_PUBLIC_ANALYTICS_DEBUG === '1';
  if (debugMode) metadata = { ...(metadata || {}), debug: true };

  return {
    event_type: params.event_type,
    entity_type: params.entity_type,
    entity_id: params.entity_id,
    session_id: sessionId,
    user_agent: userAgent,
    referrer: referrer,
    metadata,
  };
}

/**
 * Track an analytics event
 * Automatically includes session_id, user_agent, referrer, and stored UTM
 * Includes timeout to prevent hanging on mobile Safari
 * Uses keepalive for link clicks to ensure tracking completes even if navigation occurs
 */
export async function trackEvent(params: TrackEventParams): Promise<void> {
  if (typeof window === "undefined") {
    return;
  }

  // Skip if this browser opted out, or in dev (unless forced on via the toggle)
  if (shouldSkipTracking()) {
    console.log("Analytics tracking skipped:", params);
    return;
  }

  const payload = buildPayload(params);

  console.log("Sending analytics event:", payload);

  // For link clicks, use keepalive to ensure the request completes even if navigation occurs
  const isLinkClick = params.event_type === "link_click";

  try {
    const fetchOptions: RequestInit = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      keepalive: isLinkClick, // Keep request alive for link clicks even if page unloads
    };

    // For link clicks, fire and forget with keepalive to avoid blocking navigation
    // For other events, await the response
    if (isLinkClick) {
      // Fire and forget for link clicks - keepalive ensures it completes
      fetch("/api/admin/analytics", fetchOptions).catch((error) => {
        console.error("Error tracking link click event:", error);
      });
    } else {
      // For non-link-click events, use timeout to prevent hanging on mobile Safari
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      fetchOptions.signal = controller.signal;
      
      const response = await fetch("/api/admin/analytics", fetchOptions);
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Failed to track event:", response.status, errorText);
      } else {
        const result = await response.json();
        console.log("Event tracked successfully:", result);
      }
    }
  } catch (error) {
    // Silently fail - don't interrupt user experience
    // Ignore AbortError from timeout
    if (error instanceof Error && error.name !== 'AbortError') {
      console.error("Error tracking event:", error);
    }
  }
}

/**
 * Track an analytics event via navigator.sendBeacon.
 * Survives page unload — used for `page_engagement` on tab-hide/leave, where a
 * normal fetch gets killed by the browser. Returns whether the beacon was queued.
 */
export function trackEventBeacon(params: TrackEventParams): boolean {
  if (typeof window === "undefined" || typeof navigator.sendBeacon !== "function") {
    return false;
  }

  // Skip if this browser opted out, or in dev (unless forced on via the toggle)
  if (shouldSkipTracking()) {
    console.log("Analytics beacon skipped:", params);
    return false;
  }

  const payload = buildPayload(params);

  try {
    const blob = new Blob([JSON.stringify(payload)], { type: "application/json" });
    return navigator.sendBeacon("/api/admin/analytics", blob);
  } catch (error) {
    console.error("Error sending analytics beacon:", error);
    return false;
  }
}

/**
 * Track session start
 * Should be called once per session when the page loads
 */
export function trackSessionStart(): void {
  // Skip if this browser opted out, or in dev (unless forced on via the toggle)
  if (shouldSkipTracking()) {
    console.log("Analytics session start skipped");
    return;
  }

  const sessionId = getOrCreateSessionId();
  
  // Check if we've already tracked session start for this session
  const sessionStartKey = `session_start_${sessionId}`;
  let hasTrackedSession = false;
  
  try {
    hasTrackedSession = !!sessionStorage.getItem(sessionStartKey);
  } catch (e) {
    // sessionStorage might not be available (private browsing, etc.)
    // Continue without checking - we'll still track the event
  }
  
  if (!hasTrackedSession) {
    trackEvent({
      event_type: "session_start",
      entity_type: "page",
      entity_id: window.location.pathname || "/",
      metadata: {
        pathname: window.location.pathname,
        search: window.location.search,
      },
    });
    
    // Mark as tracked for this session
    try {
      sessionStorage.setItem(sessionStartKey, "true");
    } catch (e) {
      // sessionStorage might not be available - that's ok
    }
  }
}

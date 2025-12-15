"use client";

/**
 * Analytics utility for tracking user events
 * Handles session management and event tracking
 */

const SESSION_COOKIE_NAME = "analytics_session_id";
const SESSION_DURATION = 30 * 60; // 30 minutes in seconds

export type EventType = "page_view" | "link_click" | "section_view" | "session_start";
export type EntityType = "cta_button" | "site_section" | "page" | "testimonial" | "faq_item" | "media";

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
 * Track an analytics event
 * Automatically includes session_id, user_agent, and referrer
 * Includes timeout to prevent hanging on mobile Safari
 * Uses keepalive for link clicks to ensure tracking completes even if navigation occurs
 */
export async function trackEvent(params: TrackEventParams): Promise<void> {
  if (typeof window === "undefined") {
    return;
  }

  const sessionId = getOrCreateSessionId();

  // Get user agent and referrer from browser
  const userAgent = navigator.userAgent || null;
  const referrer = document.referrer || null;

  const payload = {
    event_type: params.event_type,
    entity_type: params.entity_type,
    entity_id: params.entity_id,
    session_id: sessionId,
    user_agent: userAgent,
    referrer: referrer,
    metadata: params.metadata || null,
  };

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
 * Track session start
 * Should be called once per session when the page loads
 */
export function trackSessionStart(): void {
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

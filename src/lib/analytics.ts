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

  // Generate new session ID
  const sessionId = crypto.randomUUID();

  // Store in cookie with 30-minute expiration
  const expires = new Date();
  expires.setTime(expires.getTime() + SESSION_DURATION * 1000);
  document.cookie = `${SESSION_COOKIE_NAME}=${encodeURIComponent(sessionId)}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;

  return sessionId;
}

/**
 * Track an analytics event
 * Automatically includes session_id, user_agent, and referrer
 */
export async function trackEvent(params: TrackEventParams): Promise<void> {
  if (typeof window === "undefined") {
    return;
  }

  const sessionId = getOrCreateSessionId();

  // Get user agent and referrer from browser
  const userAgent = navigator.userAgent || null;
  const referrer = document.referrer || null;

  try {
    const response = await fetch("/api/admin/analytics", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        event_type: params.event_type,
        entity_type: params.entity_type,
        entity_id: params.entity_id,
        session_id: sessionId,
        user_agent: userAgent,
        referrer: referrer,
        metadata: params.metadata || null,
      }),
    });

    if (!response.ok) {
      console.error("Failed to track event:", await response.text());
    }
  } catch (error) {
    // Silently fail - don't interrupt user experience
    console.error("Error tracking event:", error);
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
  const hasTrackedSession = sessionStorage.getItem(sessionStartKey);
  
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
      // sessionStorage might not be available
    }
  }
}

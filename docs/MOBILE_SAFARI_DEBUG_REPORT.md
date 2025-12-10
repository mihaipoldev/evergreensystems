# Mobile Safari Debug Report
## Landing Page Failure Analysis

**Date:** 2025-01-07  
**Issue:** Landing page works on desktop but fails to load on mobile Safari, showing partial render then "site can't be reached"

---

## 🔴 CRITICAL ISSUES (Most Likely Root Causes)

### 1. **Hero.tsx - Massive useEffect with Multiple Intervals/Timeouts**
**File:** `src/components/landing/Hero.tsx`  
**Lines:** 136-461  
**Severity:** CRITICAL

**Problem:**
The `useEffect` hook in Hero.tsx contains an extremely heavy implementation with:
- **7 setTimeout calls** (100ms, 300ms, 500ms, 1000ms, 2000ms, 3000ms, 4000ms)
- **2 setInterval calls** (one every 500ms for 20 iterations, one every 100ms for 50 iterations)
- **Multiple event bindings** (play, hasplayed, timechange, statechange, loadeddata)
- **MutationObserver** watching the entire iframe DOM
- **Cross-origin iframe access attempts** that fail silently but still execute

**Why it breaks mobile:**
- Mobile Safari has stricter memory limits and will kill tabs that consume too much
- Multiple intervals running simultaneously can cause the main thread to block
- MutationObserver on a cross-origin iframe triggers constant errors on mobile
- The combination of all these timers can cause the page to hang or crash

**Fix:**
```typescript
// Replace the entire useEffect (lines 136-461) with a lighter version:

useEffect(() => {
  if (typeof window === 'undefined' || !videoId) return;

  const getPrimaryColor = () => {
    if (typeof window === 'undefined') return '#0a7afa';
    const root = document.documentElement;
    const computedStyle = getComputedStyle(root);
    let primaryValue = computedStyle.getPropertyValue('--primary').trim();
    let h, s, l;
    
    if (primaryValue) {
      const hslMatch = primaryValue.match(/(\d+)\s+(\d+)%\s+(\d+)%/);
      if (hslMatch) {
        h = parseInt(hslMatch[1]);
        s = parseInt(hslMatch[2]);
        l = parseInt(hslMatch[3]);
      } else {
        h = parseInt(computedStyle.getPropertyValue('--brand-h').trim() || '212');
        s = parseInt(computedStyle.getPropertyValue('--brand-s').trim() || '96');
        l = parseInt(computedStyle.getPropertyValue('--brand-l').trim() || '51');
      }
    } else {
      h = parseInt(computedStyle.getPropertyValue('--brand-h').trim() || '212');
      s = parseInt(computedStyle.getPropertyValue('--brand-s').trim() || '96');
      l = parseInt(computedStyle.getPropertyValue('--brand-l').trim() || '51');
    }
    
    return hslToHex(h, s, l);
  };

  // Initialize Wistia Queue - simplified
  (window as any)._wq = (window as any)._wq || [];
  const primaryColor = getPrimaryColor();
  const hexWithoutHash = primaryColor.replace('#', '');
  
  // Remove any existing queue item
  (window as any)._wq = (window as any)._wq.filter((item: any) => item.id !== videoId);
  
  // Push player options ONCE
  (window as any)._wq.push({
    id: videoId,
    options: {
      playerColor: hexWithoutHash,
      playerColorFade: false,
    },
    onReady: function(video: any) {
      // Set color once when ready
      if (typeof video.playerColor === 'function') {
        video.playerColor(hexWithoutHash);
      }
      
      // Track video play event
      video.bind('play', function() {
        const mediaId = mainMedia?.id || videoId || 'unknown';
        handleVideoPlay(mediaId);
      });
    }
  });

  // Cleanup function
  return () => {
    // Clear any intervals/timeouts if they exist
    // (none in this simplified version)
  };
}, [videoId, mainMedia?.id]);
```

---

### 2. **Analytics API Fetch Without Timeout**
**File:** `src/lib/analytics.ts`  
**Lines:** 54-89  
**Severity:** CRITICAL

**Problem:**
The `trackEvent` function makes a fetch request without a timeout. On mobile Safari with poor connectivity, this can hang indefinitely and block the page.

**Why it breaks mobile:**
- Mobile Safari is more aggressive about killing slow requests
- If the API is slow or unreachable, the fetch can hang for 30+ seconds
- This blocks the main thread and causes "site can't be reached" errors

**Fix:**
```typescript
export async function trackEvent(params: TrackEventParams): Promise<void> {
  if (typeof window === "undefined") {
    return;
  }

  const sessionId = getOrCreateSessionId();
  const userAgent = navigator.userAgent || null;
  const referrer = document.referrer || null;

  try {
    // Add timeout using AbortController
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

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
      signal: controller.signal, // Add abort signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error("Failed to track event:", await response.text());
    }
  } catch (error) {
    // Silently fail - don't interrupt user experience
    if (error instanceof Error && error.name !== 'AbortError') {
      console.error("Error tracking event:", error);
    }
  }
}
```

---

### 3. **crypto.randomUUID() May Not Be Available**
**File:** `src/lib/analytics.ts`  
**Lines:** 40  
**Severity:** HIGH

**Problem:**
`crypto.randomUUID()` is not available in older mobile Safari versions (iOS < 15.4). This will throw an error and break analytics, potentially causing the page to fail.

**Why it breaks mobile:**
- Older iOS devices don't support `crypto.randomUUID()`
- The error can propagate and crash the page if not caught properly

**Fix:**
```typescript
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
      // Fallback for older browsers
      sessionId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    }
  } catch (e) {
    // Ultimate fallback
    sessionId = Date.now().toString(36) + Math.random().toString(36).substring(2);
  }

  // Store in cookie with 30-minute expiration
  const expires = new Date();
  expires.setTime(expires.getTime() + SESSION_DURATION * 1000);
  document.cookie = `${SESSION_COOKIE_NAME}=${encodeURIComponent(sessionId)}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;

  return sessionId;
}
```

---

### 4. **sessionStorage Access Without Error Handling**
**File:** `src/lib/analytics.ts`  
**Lines:** 100, 115  
**Severity:** MEDIUM

**Problem:**
`sessionStorage` access can fail in mobile Safari private browsing mode or when storage is disabled. The code has a try-catch but it's not comprehensive.

**Why it breaks mobile:**
- Private browsing mode in Safari disables sessionStorage
- Some mobile browsers have stricter storage policies
- Errors can propagate if not caught properly

**Fix:**
```typescript
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
```

---

## 🟡 HIGH PRIORITY ISSUES

### 5. **Heavy Wistia Scripts Loading**
**File:** `src/components/landing/Hero.tsx`  
**Lines:** 533-643  
**Severity:** HIGH

**Problem:**
Multiple Wistia scripts are loaded with `strategy="afterInteractive"`, but they're still heavy third-party scripts that can block rendering on mobile.

**Why it breaks mobile:**
- Third-party scripts can be slow to load on mobile networks
- Multiple script tags increase load time
- Mobile Safari may timeout waiting for scripts

**Fix:**
- Consider lazy loading Wistia only when video is in viewport
- Use `strategy="lazyOnload"` instead of `afterInteractive`
- Add error handling for script load failures

```typescript
{videoId && (
  <>
    <Script
      key={`wistia-queue-${videoId}`}
      id="wistia-queue-setup"
      strategy="lazyOnload" // Changed from beforeInteractive
      dangerouslySetInnerHTML={{
        __html: `...` // Keep existing code
      }}
    />
    
    <Script
      key={`wistia-media-${videoId}`}
      src={`https://fast.wistia.com/embed/medias/${videoId}.jsonp`}
      strategy="lazyOnload" // Changed from afterInteractive
      onError={(e) => {
        console.error('Wistia script failed to load:', e);
        // Don't crash the page if Wistia fails
      }}
    />
    <Script
      key="wistia-external"
      src="https://fast.wistia.com/assets/external/E-v1.js"
      strategy="lazyOnload" // Changed from afterInteractive
      onError={(e) => {
        console.error('Wistia external script failed to load:', e);
      }}
    />
  </>
)}
```

---

### 6. **No Error Boundaries**
**File:** `src/app/(public)/page.tsx`  
**Severity:** HIGH

**Problem:**
There are no React Error Boundaries to catch component errors. If any component crashes, the entire page fails.

**Why it breaks mobile:**
- Mobile Safari is less forgiving of JavaScript errors
- A single component error can crash the entire page
- No graceful degradation

**Fix:**
Create an error boundary component and wrap the landing page:

```typescript
// src/components/ErrorBoundary.tsx
"use client";

import React from 'react';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
            <p className="text-muted-foreground">Please refresh the page.</p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

Then wrap components in `page.tsx`:
```typescript
<ErrorBoundary>
  <Navbar sections={sections} />
</ErrorBoundary>
<ErrorBoundary>
  <main className="w-full">
    {sections.length > 0 ? (
      sections.map((section) => (
        <ErrorBoundary key={section.id}>
          {renderSection(section)}
        </ErrorBoundary>
      ))
    ) : (
      // ... loading state
    )}
  </main>
</ErrorBoundary>
```

---

### 7. **Navbar Scroll Handler Could Be Optimized**
**File:** `src/components/landing/Navbar.tsx`  
**Lines:** 123-212  
**Severity:** MEDIUM

**Problem:**
The scroll handler uses `requestAnimationFrame` which is good, but it still runs on every scroll event and does DOM queries. On mobile, this can cause jank.

**Why it breaks mobile:**
- Mobile Safari has less CPU power
- Scroll events fire very frequently
- Multiple `getElementById` calls on each scroll can be expensive

**Fix:**
Add better throttling and cache element references:

```typescript
useEffect(() => {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return;
  }

  // Cache element references
  const elements = new Map<string, HTMLElement | null>();
  navLinks.forEach(link => {
    elements.set(link.sectionId, document.getElementById(link.sectionId));
  });
  const ctaElement = document.getElementById('cta');
  const firstSection = navLinks[0];
  const firstElement = firstSection ? elements.get(firstSection.sectionId) : null;
  const heroOffset = firstElement ? firstElement.offsetTop - 300 : 400;

  let lastScrollY = window.scrollY;
  let ticking = false;

  const handleScroll = () => {
    const scrollY = window.scrollY;
    
    // Skip if scroll hasn't changed much (throttle)
    if (Math.abs(scrollY - lastScrollY) < 5) {
      return;
    }
    lastScrollY = scrollY;

    // Check CTA section
    if (ctaElement) {
      const { offsetTop, offsetHeight } = ctaElement;
      const ctaTop = offsetTop - 200;
      const ctaBottom = offsetTop + offsetHeight - 100;
      
      if (scrollY >= ctaTop && scrollY < ctaBottom) {
        setActiveSection('cta');
        return;
      }
    }
    
    if (scrollY < heroOffset) {
      setActiveSection('');
      return;
    }

    // Find active section
    let activeId = '';
    for (const link of navLinks) {
      const element = elements.get(link.sectionId);
      if (element) {
        const { offsetTop, offsetHeight } = element;
        const sectionTop = offsetTop - 200;
        const sectionBottom = offsetTop + offsetHeight - 100;
        
        if (scrollY >= sectionTop && scrollY < sectionBottom) {
          activeId = link.sectionId;
          break;
        }
      }
    }
    
    setActiveSection(activeId || '');
  };

  const throttledHandleScroll = () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        handleScroll();
        ticking = false;
      });
      ticking = true;
    }
  };
  
  // Initial check
  const timeoutId = setTimeout(() => {
    handleScroll();
  }, 150);
  
  window.addEventListener('scroll', throttledHandleScroll, { passive: true });

  return () => {
    clearTimeout(timeoutId);
    if (typeof window !== "undefined") {
      window.removeEventListener('scroll', throttledHandleScroll);
    }
  };
}, [navLinks]);
```

---

## 🟢 MEDIUM PRIORITY ISSUES

### 8. **Server-Side Database Queries Without Timeout**
**File:** `src/app/(public)/page.tsx`  
**Lines:** 51-81  
**Severity:** MEDIUM

**Problem:**
Multiple database queries run sequentially without timeouts. If Supabase is slow, the page can hang.

**Why it breaks mobile:**
- Mobile networks are slower
- Server-side rendering waits for all queries
- No timeout means indefinite wait

**Fix:**
Add timeout wrappers and better error handling:

```typescript
// Create a timeout wrapper
function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), timeoutMs)
    )
  ]);
}

export default async function LandingPage() {
  let sections: Section[] = [];
  let homePage: Database["public"]["Tables"]["pages"]["Row"] | null = null;
  
  try {
    homePage = await withTimeout(getPageBySlug('home'), 5000); // 5 second timeout
    if (homePage) {
      sections = await withTimeout(getVisibleSectionsByPageId(homePage.id), 5000);
    }
  } catch (error) {
    console.error('Error fetching page sections:', error);
    // Continue with empty sections - page will show loading state
  }

  // Similar for other queries...
  let faqItems: Database["public"]["Tables"]["faq_items"]["Row"][] = [];
  let testimonials: Database["public"]["Tables"]["testimonials"]["Row"][] = [];
  let offerFeatures: Database["public"]["Tables"]["offer_features"]["Row"][] = [];
  
  // Run in parallel with timeouts
  try {
    [faqItems, testimonials, offerFeatures] = await Promise.allSettled([
      withTimeout(getAllFAQItems(), 5000).catch(() => []),
      withTimeout(getApprovedTestimonials(), 5000).catch(() => []),
      withTimeout(getAllOfferFeatures(), 5000).catch(() => []),
    ]).then(results => [
      results[0].status === 'fulfilled' ? results[0].value : [],
      results[1].status === 'fulfilled' ? results[1].value : [],
      results[2].status === 'fulfilled' ? results[2].value : [],
    ]);
  } catch (error) {
    console.error('Error fetching section data:', error);
    // Continue with empty arrays
  }

  // ... rest of component
}
```

---

### 9. **Inline Script in Hero.tsx Accesses window During SSR**
**File:** `src/components/landing/Hero.tsx`  
**Lines:** 540-628  
**Severity:** MEDIUM

**Problem:**
The inline script tries to access `document.documentElement` and `getComputedStyle` which may not be available during SSR or initial hydration.

**Why it breaks mobile:**
- Mobile Safari has stricter hydration rules
- Accessing DOM before it's ready can cause errors
- Script runs before React hydrates

**Fix:**
Wrap all DOM access in checks:

```typescript
<Script
  key={`wistia-queue-${videoId}`}
  id="wistia-queue-setup"
  strategy="beforeInteractive"
  dangerouslySetInnerHTML={{
    __html: `
      (function() {
        // Wait for DOM to be ready
        if (typeof window === 'undefined' || typeof document === 'undefined') {
          return;
        }
        
        function initWistia() {
          if (typeof document.documentElement === 'undefined') {
            setTimeout(initWistia, 50);
            return;
          }
          
          window._wq = window._wq || [];
          var videoId = '${videoId}';
          
          // ... rest of script with proper checks
        }
        
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', initWistia);
        } else {
          initWistia();
        }
      })();
    `
  }}
/>
```

---

## 📋 SUMMARY

### Most Likely Root Cause:
**The Hero.tsx useEffect with multiple intervals, timeouts, and MutationObserver is the most likely culprit.** This creates excessive CPU usage and memory consumption that mobile Safari cannot handle, causing the page to hang or crash.

### Priority Fix Order:
1. ✅ Fix Hero.tsx useEffect (remove intervals/timeouts)
2. ✅ Add timeout to analytics fetch
3. ✅ Add fallback for crypto.randomUUID()
4. ✅ Add Error Boundaries
5. ✅ Optimize Wistia script loading
6. ✅ Improve scroll handler performance
7. ✅ Add timeouts to database queries

### Testing Checklist:
- [ ] Test on iOS Safari (latest)
- [ ] Test on iOS Safari (older version)
- [ ] Test in private browsing mode
- [ ] Test with slow 3G connection
- [ ] Test with airplane mode (offline)
- [ ] Monitor CPU usage during page load
- [ ] Check browser console for errors
- [ ] Verify no infinite loops in React DevTools

---

## 🔧 Quick Fix Script

Run this to apply the most critical fixes:

```bash
# The fixes need to be applied manually to the files listed above
# Priority order:
# 1. src/components/landing/Hero.tsx (lines 136-461)
# 2. src/lib/analytics.ts (lines 54-89, 40, 100-120)
# 3. Add ErrorBoundary component
# 4. Update src/app/(public)/page.tsx to use ErrorBoundary
```

---

**Report Generated:** 2025-01-07  
**Next Steps:** Apply fixes in priority order and test on actual mobile devices.

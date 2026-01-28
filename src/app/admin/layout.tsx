"use client";

import { AdminHeader } from "@/components/admin/layout/AdminHeader";
import { AdminSidebar } from "@/components/admin/layout/AdminSidebar";
import { AdminFooter } from "@/components/shared/AdminFooter";
import { NavigationLoadingProvider } from "@/providers/NavigationLoadingProvider";
import { AdminThemeProvider } from "@/providers/AdminThemeProvider";
import { QueryClientProvider } from "@/providers/QueryClientProvider";
import { PageTransitionLoader } from "@/components/admin/layout/PageTransitionLoader";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { getTimestamp, getDuration, debugClientTiming } from "@/lib/debug-performance";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const mountStartTime = useRef<number>(getTimestamp());
  const providersInitTime = useRef<number | null>(null);
  const firstRenderTime = useRef<number | null>(null);
  const isWebsiteSettingsPage = pathname === '/admin/website-settings';

  // CRITICAL: Restore colors from cookie/sessionStorage IMMEDIATELY on mount
  // This runs synchronously to prevent any flash of default colors
  // Must run before any other effects to ensure colors are applied first
  useEffect(() => {
    console.log('[COLOR DEBUG] AdminLayout - Starting color restoration useEffect');
    if (typeof window === "undefined" || typeof document === "undefined") {
      console.log('[COLOR DEBUG] AdminLayout - Window/document not available');
      return;
    }

    // Run synchronously - don't wait for anything
    const root = document.documentElement;
    let savedColor = null;
    let savedAccentColor = null;

    // Try cookie first
    try {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.startsWith('primary-color-hsl=')) {
          const cookieValue = cookie.substring('primary-color-hsl='.length);
          try {
            savedColor = decodeURIComponent(cookieValue);
            if (!/^\d+\s+\d+%\s+\d+%$/.test(savedColor)) {
              savedColor = null;
            }
          } catch (e) {
            savedColor = null;
          }
        } else if (cookie.startsWith('accent-color-hsl=')) {
          const cookieValue = cookie.substring('accent-color-hsl='.length);
          try {
            savedAccentColor = decodeURIComponent(cookieValue);
            if (!/^\d+\s+\d+%\s+\d+%$/.test(savedAccentColor)) {
              savedAccentColor = null;
            }
          } catch (e) {
            savedAccentColor = null;
          }
        }
      }
    } catch (e) {
      // Cookie parsing failed
      console.log('[COLOR DEBUG] AdminLayout - Cookie parsing failed:', e);
    }

    console.log('[COLOR DEBUG] AdminLayout - Primary color from cookie:', savedColor);
    console.log('[COLOR DEBUG] AdminLayout - Accent color from cookie:', savedAccentColor);

    // Fallback to sessionStorage
    if (!savedColor) {
      try {
        savedColor = sessionStorage.getItem('primary-color-hsl');
        if (savedColor && !/^\d+\s+\d+%\s+\d+%$/.test(savedColor)) {
          savedColor = null;
        }
      } catch (e) {
        // sessionStorage not available
      }
    }

    if (!savedAccentColor) {
      try {
        savedAccentColor = sessionStorage.getItem('accent-color-hsl');
        if (savedAccentColor && !/^\d+\s+\d+%\s+\d+%$/.test(savedAccentColor)) {
          savedAccentColor = null;
        }
      } catch (e) {
        // sessionStorage not available
        console.log('[COLOR DEBUG] AdminLayout - sessionStorage read failed:', e);
      }
    }

    console.log('[COLOR DEBUG] AdminLayout - Final primary color:', savedColor);
    console.log('[COLOR DEBUG] AdminLayout - Final accent color:', savedAccentColor);

    // Apply primary color if found
    // Always restore colors to ensure they persist on refresh, even if server styles exist
    if (savedColor) {
      try {
        const hslMatch = savedColor.match(/(\d+)\s+(\d+)%\s+(\d+)%/);
        if (hslMatch) {
          const [, h, s, l] = hslMatch;
          
          // Apply via inline styles for immediate effect
          root.style.setProperty('--brand-h', h, 'important');
          root.style.setProperty('--brand-s', s, 'important');
          root.style.setProperty('--brand-l', l, 'important');
          root.style.setProperty('--primary', savedColor, 'important');
          
          // Also inject style tag for persistence (only if not already exists)
          const styleId = 'primary-color-admin-layout-restore';
          if (!document.getElementById(styleId)) {
            const style = document.createElement('style');
            style.id = styleId;
            // Use maximum specificity to override default CSS
            const maxSpecificitySelector = `html.preset-admin,html.preset-admin.dark,html.preset-admin *,html.preset-admin.dark *,body.preset-admin,body.preset-admin.dark,body.preset-admin *,body.preset-admin.dark *,.preset-admin,.preset-admin *,.preset-admin.dark,.preset-admin.dark *`;
            style.textContent = `${maxSpecificitySelector}{--brand-h:${h}!important;--brand-s:${s}!important;--brand-l:${l}!important;--primary:${savedColor}!important;}`;
            console.log('[COLOR DEBUG] AdminLayout - Creating primary color style tag with:', { h, s, l, savedColor });
            if (document.head) {
              // Always insert at the very beginning to ensure highest priority
              // This overrides any default styles from globals.css
              if (document.head.firstChild) {
                document.head.insertBefore(style, document.head.firstChild);
              } else {
                document.head.appendChild(style);
              }
              console.log('[COLOR DEBUG] AdminLayout - Primary color style tag inserted');
            }
          }
        }
      } catch (e) {
        // Error applying color, ignore
        console.error('[COLOR DEBUG] AdminLayout - Error applying primary color:', e);
      }
    } else {
      console.log('[COLOR DEBUG] AdminLayout - No saved primary color found');
    }

    // Apply accent color if found
    if (savedAccentColor) {
      try {
        const accentHslMatch = savedAccentColor.match(/(\d+)\s+(\d+)%\s+(\d+)%/);
        if (accentHslMatch) {
          const [, h, s, l] = accentHslMatch;
          
          console.log('[COLOR DEBUG] AdminLayout - Applying accent color:', { h, s, l, savedAccentColor });
          
          // Apply via inline styles for immediate effect
          root.style.setProperty('--accent-h', h, 'important');
          root.style.setProperty('--accent-s', s, 'important');
          root.style.setProperty('--accent-l', l, 'important');
          root.style.setProperty('--accent', savedAccentColor, 'important');
          
          // Also inject style tag for persistence (only if not already exists)
          const accentStyleId = 'accent-color-admin-layout-restore';
          if (!document.getElementById(accentStyleId)) {
            console.log('[COLOR DEBUG] AdminLayout - Creating accent color style tag');
            const accentStyle = document.createElement('style');
            accentStyle.id = accentStyleId;
            // Use maximum specificity to override default CSS
            const maxSpecificitySelector = `html.preset-admin,html.preset-admin.dark,html.preset-admin *,html.preset-admin.dark *,body.preset-admin,body.preset-admin.dark,body.preset-admin *,body.preset-admin.dark *,.preset-admin,.preset-admin *,.preset-admin.dark,.preset-admin.dark *`;
            accentStyle.textContent = `${maxSpecificitySelector}{--accent-h:${h}!important;--accent-s:${s}!important;--accent-l:${l}!important;--accent:${savedAccentColor}!important;}`;
            if (document.head) {
              // Insert right after primary color style, or at beginning if no primary style
              const primaryStyle = document.getElementById('primary-color-admin-layout-restore');
              if (primaryStyle && primaryStyle.nextSibling) {
                document.head.insertBefore(accentStyle, primaryStyle.nextSibling);
              } else if (primaryStyle) {
                document.head.insertBefore(accentStyle, primaryStyle);
              } else {
                // No primary style yet, insert at beginning
                if (document.head.firstChild) {
                  document.head.insertBefore(accentStyle, document.head.firstChild);
                } else {
                  document.head.appendChild(accentStyle);
                }
              }
              console.log('[COLOR DEBUG] AdminLayout - Accent color style tag inserted');
            }
          } else {
            console.log('[COLOR DEBUG] AdminLayout - Accent color style tag already exists');
          }
        }
      } catch (e) {
          // Error applying accent color, ignore
          console.error('[COLOR DEBUG] AdminLayout - Error applying accent color:', e);
        }
      } else {
        console.log('[COLOR DEBUG] AdminLayout - No saved accent color found');
      }
      // Log computed CSS values to verify colors are applied
      try {
        const computedStyle = window.getComputedStyle(document.documentElement);
        const brandH = computedStyle.getPropertyValue('--brand-h').trim();
        const brandS = computedStyle.getPropertyValue('--brand-s').trim();
        const brandL = computedStyle.getPropertyValue('--brand-l').trim();
        const primary = computedStyle.getPropertyValue('--primary').trim();
        console.log('[COLOR DEBUG] AdminLayout - Computed CSS values:', {
          '--brand-h': brandH,
          '--brand-s': brandS,
          '--brand-l': brandL,
          '--primary': primary
        });
      } catch (e) {
        console.log('[COLOR DEBUG] AdminLayout - Could not read computed styles:', e);
      }
      
      // Watch for changes to style tags or preset class that might reset colors
      // Capture saved colors in closure
      const capturedPrimaryColor = savedColor;
      const capturedAccentColor = savedAccentColor;
      
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList') {
            mutation.addedNodes.forEach((node) => {
              if (node.nodeType === 1 && (node as Element).tagName === 'STYLE') {
                const styleId = (node as Element).id;
                console.log('[COLOR DEBUG] AdminLayout - Style tag added:', styleId);
              }
            });
            mutation.removedNodes.forEach((node) => {
              if (node.nodeType === 1 && (node as Element).tagName === 'STYLE') {
                const styleId = (node as Element).id;
                console.log('[COLOR DEBUG] AdminLayout - Style tag removed:', styleId);
                // If our color style tag was removed, restore it
                if (styleId === 'primary-color-admin-layout-restore' || 
                    styleId === 'primary-color-session' ||
                    styleId === 'primary-color-inline-server') {
                  console.warn('[COLOR DEBUG] AdminLayout - Color style tag was removed! Restoring...');
                  // Re-apply colors
                  if (capturedPrimaryColor) {
                    const hslMatch = capturedPrimaryColor.match(/(\d+)\s+(\d+)%\s+(\d+)%/);
                    if (hslMatch) {
                      const [, h, s, l] = hslMatch;
                      const style = document.createElement('style');
                      style.id = 'primary-color-admin-layout-restore';
                      style.textContent = `.preset-admin,.preset-admin *,.preset-admin.dark,.preset-admin.dark *{--brand-h:${h}!important;--brand-s:${s}!important;--brand-l:${l}!important;--primary:${capturedPrimaryColor}!important;}`;
                      if (document.head.firstChild) {
                        document.head.insertBefore(style, document.head.firstChild);
                      } else {
                        document.head.appendChild(style);
                      }
                      const root = document.documentElement;
                      root.style.setProperty('--brand-h', h, 'important');
                      root.style.setProperty('--brand-s', s, 'important');
                      root.style.setProperty('--brand-l', l, 'important');
                      root.style.setProperty('--primary', capturedPrimaryColor, 'important');
                    }
                  }
                }
              }
            });
          }
          if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
            const target = mutation.target as HTMLElement;
            if (target === document.documentElement) {
              console.log('[COLOR DEBUG] AdminLayout - HTML class changed:', target.className);
              // Check if preset-admin was removed and then re-added
              if (target.classList.contains('preset-admin') && capturedPrimaryColor) {
                // Re-apply colors after class change to ensure they persist
                setTimeout(() => {
                  const hslMatch = capturedPrimaryColor.match(/(\d+)\s+(\d+)%\s+(\d+)%/);
                  if (hslMatch) {
                    const [, h, s, l] = hslMatch;
                    const root = document.documentElement;
                    root.style.setProperty('--brand-h', h, 'important');
                    root.style.setProperty('--brand-s', s, 'important');
                    root.style.setProperty('--brand-l', l, 'important');
                    root.style.setProperty('--primary', capturedPrimaryColor, 'important');
                    console.log('[COLOR DEBUG] AdminLayout - Colors re-applied after class change');
                  }
                }, 0);
              }
            }
          }
        });
      });

      // Observe head for style tag changes
      if (document.head) {
        observer.observe(document.head, {
          childList: true,
          subtree: false
        });
      }

      // Observe html element for class changes
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class']
      });

      console.log('[COLOR DEBUG] AdminLayout - MutationObserver set up to watch for color resets');
      
      // Periodic check to detect if colors are being reset
      let checkCount = 0;
      const colorCheckInterval = setInterval(() => {
        checkCount++;
        try {
          const computedStyle = window.getComputedStyle(document.documentElement);
          const brandH = computedStyle.getPropertyValue('--brand-h').trim();
          const brandS = computedStyle.getPropertyValue('--brand-s').trim();
          const brandL = computedStyle.getPropertyValue('--brand-l').trim();
          const primary = computedStyle.getPropertyValue('--primary').trim();
          
          // Check if colors match what we restored
          if (capturedPrimaryColor) {
            const expectedMatch = capturedPrimaryColor.match(/(\d+)\s+(\d+)%\s+(\d+)%/);
            if (expectedMatch) {
              const [, expectedH, expectedS, expectedL] = expectedMatch;
              const expectedPrimary = capturedPrimaryColor;
              
              if (brandH !== expectedH || brandS !== expectedS || brandL !== expectedL || primary !== expectedPrimary) {
                console.warn(`[COLOR DEBUG] AdminLayout - ⚠️ COLOR MISMATCH DETECTED at check #${checkCount}:`, {
                  expected: { h: expectedH, s: expectedS, l: expectedL, primary: expectedPrimary },
                  actual: { h: brandH, s: brandS, l: brandL, primary: primary }
                });
                
                // Restore colors if they don't match
                const hslMatch = capturedPrimaryColor.match(/(\d+)\s+(\d+)%\s+(\d+)%/);
                if (hslMatch) {
                  const [, h, s, l] = hslMatch;
                  const root = document.documentElement;
                  root.style.setProperty('--brand-h', h, 'important');
                  root.style.setProperty('--brand-s', s, 'important');
                  root.style.setProperty('--brand-l', l, 'important');
                  root.style.setProperty('--primary', capturedPrimaryColor, 'important');
                  console.log('[COLOR DEBUG] AdminLayout - ✅ Colors restored after mismatch detected');
                }
              } else if (checkCount <= 3) {
                console.log(`[COLOR DEBUG] AdminLayout - ✅ Colors still correct at check #${checkCount}`);
              }
            }
          }
        } catch (e) {
          console.error('[COLOR DEBUG] AdminLayout - Error in color check:', e);
        }
        
        // Stop checking after 10 seconds (20 checks at 500ms intervals)
        if (checkCount >= 20) {
          clearInterval(colorCheckInterval);
          console.log('[COLOR DEBUG] AdminLayout - Stopped periodic color checks');
        }
      }, 500); // Check every 500ms
      
      console.log('[COLOR DEBUG] AdminLayout - Color restoration useEffect complete');
      
      return () => {
        observer.disconnect();
        clearInterval(colorCheckInterval);
      };
  }, []);

  useEffect(() => {
    const mountDuration = getDuration(mountStartTime.current);
    debugClientTiming("AdminLayout", "Mount", mountDuration);
    
    providersInitTime.current = getTimestamp();
    // Small delay to measure provider initialization
    setTimeout(() => {
      if (providersInitTime.current) {
        const providersDuration = getDuration(providersInitTime.current);
        debugClientTiming("AdminLayout", "Providers init", providersDuration);
      }
      
      firstRenderTime.current = getTimestamp();
      // Measure first render completion
      requestAnimationFrame(() => {
        if (firstRenderTime.current) {
          const firstRenderDuration = getDuration(firstRenderTime.current);
          debugClientTiming("AdminLayout", "First render", firstRenderDuration);
        }
      });
    }, 0);
  }, []);

  return (
    <QueryClientProvider>
      <AdminThemeProvider>
        <NavigationLoadingProvider>
          {/* Body scroll (single scroll), sidebar fixed on desktop; prevent horizontal scroll */}
          <div className="relative flex min-h-screen bg-background overflow-x-hidden">
            <AdminSidebar />
            <div className="relative flex flex-1 flex-col md:pl-64 min-w-0">
                  <AdminHeader />
              <main className="flex flex-1 flex-col min-w-0 px-4 md:px-10 lg:px-12">
                <div className={cn(
                  "mx-auto w-full max-w-[1400px] flex flex-col min-w-0 pt-[40px] md:pt-[84px]",
                  !isWebsiteSettingsPage && "pb-32"
                )}>
                  <div className="relative flex flex-col py-6 space-y-4 md:space-y-6 min-w-0">
                    {children}
                  </div>
                </div>
              </main>
              {!isWebsiteSettingsPage && <AdminFooter />}
              <PageTransitionLoader />
            </div>
          </div>
        </NavigationLoadingProvider>
      </AdminThemeProvider>
    </QueryClientProvider>
  );
}

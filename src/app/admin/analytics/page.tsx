"use client";

import dynamic from "next/dynamic";
import Script from "next/script";
import { PageSkeleton } from "@/components/admin/ui/PageSkeleton";
import { DashboardTimeScope } from "@/features/analytics/components/DashboardTimeScope";

// Dynamically import the analytics content with SSR disabled
// This ensures the page is truly client-side only
const AnalyticsContent = dynamic(
  () => import("./AnalyticsContent").then((mod) => ({ default: mod.AnalyticsContent })),
  {
    ssr: false,
    loading: () => (
      <PageSkeleton
        title="Analytics"
        rightSideContent={<DashboardTimeScope />}
        variant="analytics"
      />
    ),
  }
);

export default function AnalyticsPage() {
  return (
    <div>
      {/* Critical: Set font CSS variable immediately for analytics page */}
      {/* This runs before the page renders to prevent Times font flash */}
      <Script
        id="analytics-font-fix"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function() {
              // Set font CSS variable immediately before page renders
              // This prevents Times font flash on analytics page
              if (typeof document !== 'undefined' && document.documentElement) {
                const root = document.documentElement;
                // Always ensure the CSS variable is set (CSS should handle this, but this is a backup)
                // Use inline style with important to ensure it takes precedence
                root.style.setProperty('--font-geist-sans', "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif", 'important');
                // Ensure preset-admin class is set
                if (!root.classList.contains('preset-admin')) {
                  root.classList.add('preset-admin');
                }
                
                // CRITICAL: Apply colors from cookie/sessionStorage for client-side only pages
                // This ensures colors persist on refresh even when SSR is disabled
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
                        if (!/^\\d+\\s+\\d+%\\s+\\d+%$/.test(savedColor)) {
                          savedColor = null;
                        }
                      } catch (e) {
                        savedColor = null;
                      }
                    } else if (cookie.startsWith('accent-color-hsl=')) {
                      const cookieValue = cookie.substring('accent-color-hsl='.length);
                      try {
                        savedAccentColor = decodeURIComponent(cookieValue);
                        if (!/^\\d+\\s+\\d+%\\s+\\d+%$/.test(savedAccentColor)) {
                          savedAccentColor = null;
                        }
                      } catch (e) {
                        savedAccentColor = null;
                      }
                    }
                  }
                } catch (e) {
                  // Cookie parsing failed
                }
                
                // Fallback to sessionStorage
                if (!savedColor) {
                  try {
                    savedColor = sessionStorage.getItem('primary-color-hsl');
                    if (savedColor && !/^\\d+\\s+\\d+%\\s+\\d+%$/.test(savedColor)) {
                      savedColor = null;
                    }
                  } catch (e) {
                    // sessionStorage not available
                  }
                }
                
                if (!savedAccentColor) {
                  try {
                    savedAccentColor = sessionStorage.getItem('accent-color-hsl');
                    if (savedAccentColor && !/^\\d+\\s+\\d+%\\s+\\d+%$/.test(savedAccentColor)) {
                      savedAccentColor = null;
                    }
                  } catch (e) {
                    // sessionStorage not available
                  }
                }
                
                // Apply primary color if found
                if (savedColor) {
                  try {
                    const hslMatch = savedColor.match(/(\\d+)\\s+(\\d+)%\\s+(\\d+)%/);
                    if (hslMatch) {
                      const [, h, s, l] = hslMatch;
                      root.style.setProperty('--brand-h', h, 'important');
                      root.style.setProperty('--brand-s', s, 'important');
                      root.style.setProperty('--brand-l', l, 'important');
                      root.style.setProperty('--primary', savedColor, 'important');
                      
                      // Also inject style tag to ensure persistence
                      var styleId = 'primary-color-analytics-fix';
                      var existingStyle = document.getElementById(styleId);
                      if (!existingStyle) {
                        var style = document.createElement('style');
                        style.id = styleId;
                        style.textContent = '.preset-admin,.preset-admin *,.preset-admin.dark,.preset-admin.dark *{--brand-h:' + h + '!important;--brand-s:' + s + '!important;--brand-l:' + l + '!important;--primary:' + savedColor + '!important;}';
                        if (document.head) {
                          if (document.head.firstChild) {
                            document.head.insertBefore(style, document.head.firstChild);
                          } else {
                            document.head.appendChild(style);
                          }
                        }
                      }
                    }
                  } catch (e) {
                    // Error applying color, ignore
                  }
                }
                
                // Apply accent color if found
                if (savedAccentColor) {
                  try {
                    const accentHslMatch = savedAccentColor.match(/(\\d+)\\s+(\\d+)%\\s+(\\d+)%/);
                    if (accentHslMatch) {
                      const [, h, s, l] = accentHslMatch;
                      root.style.setProperty('--accent-h', h, 'important');
                      root.style.setProperty('--accent-s', s, 'important');
                      root.style.setProperty('--accent-l', l, 'important');
                      root.style.setProperty('--accent', savedAccentColor, 'important');
                      
                      // Also inject style tag to ensure persistence
                      var accentStyleId = 'accent-color-analytics-fix';
                      var existingAccentStyle = document.getElementById(accentStyleId);
                      if (!existingAccentStyle) {
                        var accentStyle = document.createElement('style');
                        accentStyle.id = accentStyleId;
                        accentStyle.textContent = '.preset-admin,.preset-admin *,.preset-admin.dark,.preset-admin.dark *{--accent-h:' + h + '!important;--accent-s:' + s + '!important;--accent-l:' + l + '!important;--accent:' + savedAccentColor + '!important;}';
                        if (document.head) {
                          var primaryStyle = document.getElementById('primary-color-analytics-fix');
                          if (primaryStyle && primaryStyle.nextSibling) {
                            document.head.insertBefore(accentStyle, primaryStyle.nextSibling);
                          } else if (primaryStyle) {
                            document.head.insertBefore(accentStyle, primaryStyle);
                          } else {
                            if (document.head.firstChild) {
                              document.head.insertBefore(accentStyle, document.head.firstChild);
                            } else {
                              document.head.appendChild(accentStyle);
                            }
                          }
                        }
                      }
                    }
                  } catch (e) {
                    // Error applying accent color, ignore
                  }
                }
              }
            })();
          `,
        }}
      />
      <AnalyticsContent />
    </div>
  );
}

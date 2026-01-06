"use client";

import Script from "next/script";

export function InstantColorApply() {
  // Script that runs before React hydrates, using cookies and sessionStorage as fallback
  const scriptContent = `
    (function() {
      const scriptStartTime = performance.now();
      console.log('[PERF] 🎨 InstantColorApply - Script execution start');
      
      // Check if color was already applied by middleware or AdminColorStyle
      if (document.getElementById('primary-color-inline') || 
          document.getElementById('primary-color-blocking') || 
          document.getElementById('primary-color-script')) {
        const alreadyAppliedDuration = performance.now() - scriptStartTime;
        console.log('[PERF] 🎨 InstantColorApply - Already applied: ' + alreadyAppliedDuration.toFixed(1) + 'ms');
        return; // Already applied
      }
      
      // Try to get primary color from cookie first (fastest, available immediately)
      const cookieReadStartTime = performance.now();
      let savedColor = null;
      // Secondary color is not applied dynamically - it comes from CSS defaults
      let savedAccentColor = null;
      try {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
          const cookie = cookies[i].trim();
          if (cookie.startsWith('primary-color-hsl=')) {
            const cookieValue = cookie.substring('primary-color-hsl='.length);
            try {
              savedColor = decodeURIComponent(cookieValue);
              // Validate format (should be "H S% L%" format)
              if (!/^\\d+\\s+\\d+%\\s+\\d+%$/.test(savedColor)) {
                savedColor = null; // Invalid format, ignore
              }
            } catch (e) {
              // decodeURIComponent failed, cookie might be malformed
              savedColor = null;
            }
          } else if (cookie.startsWith('accent-color-hsl=')) {
            const cookieValue = cookie.substring('accent-color-hsl='.length);
            try {
              savedAccentColor = decodeURIComponent(cookieValue);
              // Validate format (should be "H S% L%" format)
              if (!/^\\d+\\s+\\d+%\\s+\\d+%$/.test(savedAccentColor)) {
                savedAccentColor = null; // Invalid format, ignore
              }
            } catch (e) {
              // decodeURIComponent failed, cookie might be malformed
              savedAccentColor = null;
            }
          }
        }
      } catch (e) {
        // Cookie parsing failed
      }
      const cookieReadDuration = performance.now() - cookieReadStartTime;
      console.log('[PERF] 🎨 InstantColorApply - Cookie read: ' + cookieReadDuration.toFixed(1) + 'ms (hasColor: ' + !!savedColor + ', hasAccent: ' + !!savedAccentColor + ')');
      
      // Fallback to sessionStorage if no cookie
      if (!savedColor) {
        const storageReadStartTime = performance.now();
        try {
          savedColor = sessionStorage.getItem('primary-color-hsl');
          // Validate format (should be "H S% L%" format)
          if (savedColor && !/^\\d+\\s+\\d+%\\s+\\d+%$/.test(savedColor)) {
            savedColor = null; // Invalid format, ignore
          }
        } catch (e) {
          // sessionStorage not available
        }
        const storageReadDuration = performance.now() - storageReadStartTime;
        console.log('[PERF] 🎨 InstantColorApply - SessionStorage read: ' + storageReadDuration.toFixed(1) + 'ms (hasColor: ' + !!savedColor + ')');
      }
      
      if (!savedAccentColor) {
        try {
          savedAccentColor = sessionStorage.getItem('accent-color-hsl');
          // Validate format (should be "H S% L%" format)
          if (savedAccentColor && !/^\\d+\\s+\\d+%\\s+\\d+%$/.test(savedAccentColor)) {
            savedAccentColor = null; // Invalid format, ignore
          }
        } catch (e) {
          // sessionStorage not available
        }
      }
      
      if (savedColor) {
        try {
          const colorApplyStartTime = performance.now();
          // Parse HSL values from saved color
          const hslMatch = savedColor.match(/(\d+)\s+(\d+)%\s+(\d+)%/);
          const root = document.documentElement;
          
          if (hslMatch) {
            const [, h, s, l] = hslMatch;
            // Set brand color variables
            root.style.setProperty('--brand-h', h, 'important');
            root.style.setProperty('--brand-s', s, 'important');
            root.style.setProperty('--brand-l', l, 'important');
          }
          
          // Also set primary (for backward compatibility)
          root.style.setProperty('--primary', savedColor, 'important');
          
          // Also apply to html element directly
          var html = document.getElementsByTagName('html')[0];
          if (html && hslMatch) {
            const [, h, s, l] = hslMatch;
            html.style.setProperty('--brand-h', h, 'important');
            html.style.setProperty('--brand-s', s, 'important');
            html.style.setProperty('--brand-l', l, 'important');
            html.style.setProperty('--primary', savedColor, 'important');
          }
          
          // Inject style tag at the very beginning of head with maximum specificity
          var style = document.createElement('style');
          style.id = 'primary-color-session';
          if (hslMatch) {
            const [, h, s, l] = hslMatch;
            style.textContent = ':root,:root *,html,html *,body,body *,.preset-admin,.preset-admin *,.preset-admin.dark,.preset-admin.dark *{--brand-h:' + h + '!important;--brand-s:' + s + '!important;--brand-l:' + l + '!important;--primary:' + savedColor + '!important;}';
          } else {
            style.textContent = ':root,:root *,html,html *,body,body *,.preset-admin,.preset-admin *{--primary:' + savedColor + '!important;}';
          }
          
          // Insert immediately - this must be first in head
          const domManipStartTime = performance.now();
          if (document.head) {
            if (document.head.firstChild) {
              document.head.insertBefore(style, document.head.firstChild);
            } else {
              document.head.appendChild(style);
            }
          }
          const domManipDuration = performance.now() - domManipStartTime;
          const colorApplyDuration = performance.now() - colorApplyStartTime;
          console.log('[PERF] 🎨 InstantColorApply - Color application: ' + colorApplyDuration.toFixed(1) + 'ms (DOM: ' + domManipDuration.toFixed(1) + 'ms)');
        } catch (e) {
          // Error applying color, ignore
          console.log('[PERF] 🎨 InstantColorApply - Color application (ERROR): ' + (e instanceof Error ? e.message : 'Unknown error'));
        }
      }
      
      // Secondary color is not applied dynamically - it comes from CSS defaults in globals.css

      // Apply accent color if available
      if (savedAccentColor) {
        try {
          const accentHslMatch = savedAccentColor.match(/(\d+)\s+(\d+)%\s+(\d+)%/);
          const root = document.documentElement;
          
          if (accentHslMatch) {
            const [, h, s, l] = accentHslMatch;
            // Set accent color variables
            root.style.setProperty('--accent-h', h, 'important');
            root.style.setProperty('--accent-s', s, 'important');
            root.style.setProperty('--accent-l', l, 'important');
            root.style.setProperty('--accent', savedAccentColor, 'important');
          }
          
          // Also apply to html element directly
          var html = document.getElementsByTagName('html')[0];
          if (html && accentHslMatch) {
            const [, h, s, l] = accentHslMatch;
            html.style.setProperty('--accent-h', h, 'important');
            html.style.setProperty('--accent-s', s, 'important');
            html.style.setProperty('--accent-l', l, 'important');
            html.style.setProperty('--accent', savedAccentColor, 'important');
          }
          
          // Inject style tag for accent color
          var accentStyle = document.createElement('style');
          accentStyle.id = 'accent-color-session';
          if (accentHslMatch) {
            const [, h, s, l] = accentHslMatch;
            accentStyle.textContent = ':root,:root *,html,html *,body,body *,.preset-admin,.preset-admin *,.preset-admin.dark,.preset-admin.dark *{--accent-h:' + h + '!important;--accent-s:' + s + '!important;--accent-l:' + l + '!important;--accent:' + savedAccentColor + '!important;}';
          } else {
            accentStyle.textContent = ':root,:root *,html,html *,body,body *,.preset-admin,.preset-admin *{--accent:' + savedAccentColor + '!important;}';
          }
          
          // Insert after primary color style
          if (document.head) {
            const primaryStyle = document.getElementById('primary-color-session');
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
        } catch (e) {
          // Error applying accent color, ignore
          console.log('[PERF] 🎨 InstantColorApply - Accent color application (ERROR): ' + (e instanceof Error ? e.message : 'Unknown error'));
        }
      }
      
      const scriptTotalDuration = performance.now() - scriptStartTime;
      console.log('[PERF] 🎨 InstantColorApply - Total: ' + scriptTotalDuration.toFixed(1) + 'ms');
    })();
  `;

  return (
    <Script
      id="instant-color-apply"
      strategy="beforeInteractive"
      dangerouslySetInnerHTML={{ __html: scriptContent }}
    />
  );
}

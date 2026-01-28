"use client";

import Script from "next/script";

export function InstantColorApply() {
  // Script that runs before React hydrates, using cookies and sessionStorage as fallback
  const scriptContent = `
    (function() {
      console.log('[COLOR DEBUG] InstantColorApply - Starting color restoration');
      // CRITICAL: Always restore colors from cookies/sessionStorage on page load
      // This ensures colors persist on refresh, even if server-side styles exist
      // We'll update or create style tags as needed
      
      // Try to get primary color from cookie first (fastest, available immediately)
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
        console.log('[COLOR DEBUG] InstantColorApply - Cookie parsing failed:', e);
      }
      
      console.log('[COLOR DEBUG] InstantColorApply - Primary color from cookie:', savedColor);
      
      // Fallback to sessionStorage if no cookie
      if (!savedColor) {
        try {
          savedColor = sessionStorage.getItem('primary-color-hsl');
          // Validate format (should be "H S% L%" format)
          if (savedColor && !/^\\d+\\s+\\d+%\\s+\\d+%$/.test(savedColor)) {
            savedColor = null; // Invalid format, ignore
          }
        } catch (e) {
          // sessionStorage not available
        }
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
          console.log('[COLOR DEBUG] InstantColorApply - sessionStorage read failed:', e);
        }
      }
      
      console.log('[COLOR DEBUG] InstantColorApply - Final primary color:', savedColor);
      console.log('[COLOR DEBUG] InstantColorApply - Final accent color:', savedAccentColor);
      
      if (savedColor) {
        try {
          // Parse HSL values from saved color
          const hslMatch = savedColor.match(/(\d+)\s+(\d+)%\s+(\d+)%/);
          const root = document.documentElement;
          
          if (hslMatch) {
            const [, h, s, l] = hslMatch;
            // Set brand color variables immediately via inline styles
            root.style.setProperty('--brand-h', h, 'important');
            root.style.setProperty('--brand-s', s, 'important');
            root.style.setProperty('--brand-l', l, 'important');
            root.style.setProperty('--primary', savedColor, 'important');
            
            // Also apply to html element directly
            var html = document.getElementsByTagName('html')[0];
            if (html) {
              html.style.setProperty('--brand-h', h, 'important');
              html.style.setProperty('--brand-s', s, 'important');
              html.style.setProperty('--brand-l', l, 'important');
              html.style.setProperty('--primary', savedColor, 'important');
            }
            
            // Update or create style tag - check for existing ones first
            var existingStyle = document.getElementById('primary-color-session') ||
                               document.getElementById('primary-color-inline-server') ||
                               document.getElementById('primary-color-client');
            
            // Use maximum specificity to override default CSS
            var maxSpecificitySelector = 'html.preset-admin,html.preset-admin.dark,html.preset-admin *,html.preset-admin.dark *,body.preset-admin,body.preset-admin.dark,body.preset-admin *,body.preset-admin.dark *,.preset-admin,.preset-admin *,.preset-admin.dark,.preset-admin.dark *';
            var styleText = maxSpecificitySelector + '{--brand-h:' + h + '!important;--brand-s:' + s + '!important;--brand-l:' + l + '!important;--primary:' + savedColor + '!important;}';
            
            if (existingStyle) {
              // Update existing style tag
              console.log('[COLOR DEBUG] InstantColorApply - Updating existing style tag:', existingStyle.id);
              existingStyle.textContent = styleText;
            } else {
              console.log('[COLOR DEBUG] InstantColorApply - Creating new style tag');
              // Create new style tag at the very beginning of head
              var style = document.createElement('style');
              style.id = 'primary-color-session';
              style.textContent = styleText;
              
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
          console.error('[COLOR DEBUG] InstantColorApply - Error applying primary color:', e);
        }
      } else {
        console.log('[COLOR DEBUG] InstantColorApply - No saved primary color found');
      }
      
      // Secondary color is not applied dynamically - it comes from CSS defaults in globals.css

      // Apply accent color if available
      if (savedAccentColor) {
        try {
          const accentHslMatch = savedAccentColor.match(/(\d+)\s+(\d+)%\s+(\d+)%/);
          const root = document.documentElement;
          
          if (accentHslMatch) {
            const [, h, s, l] = accentHslMatch;
            // Set accent color variables immediately via inline styles
            root.style.setProperty('--accent-h', h, 'important');
            root.style.setProperty('--accent-s', s, 'important');
            root.style.setProperty('--accent-l', l, 'important');
            root.style.setProperty('--accent', savedAccentColor, 'important');
            
            // Also apply to html element directly
            var html = document.getElementsByTagName('html')[0];
            if (html) {
              html.style.setProperty('--accent-h', h, 'important');
              html.style.setProperty('--accent-s', s, 'important');
              html.style.setProperty('--accent-l', l, 'important');
              html.style.setProperty('--accent', savedAccentColor, 'important');
            }
            
            // Update or create accent color style tag
            var existingAccentStyle = document.getElementById('accent-color-session') ||
                                     document.getElementById('accent-color-inline-server') ||
                                     document.getElementById('accent-color-client');
            
            // Use maximum specificity to override default CSS
            var maxSpecificitySelector = 'html.preset-admin,html.preset-admin.dark,html.preset-admin *,html.preset-admin.dark *,body.preset-admin,body.preset-admin.dark,body.preset-admin *,body.preset-admin.dark *,.preset-admin,.preset-admin *,.preset-admin.dark,.preset-admin.dark *';
            var accentStyleText = maxSpecificitySelector + '{--accent-h:' + h + '!important;--accent-s:' + s + '!important;--accent-l:' + l + '!important;--accent:' + savedAccentColor + '!important;}';
            
            if (existingAccentStyle) {
              // Update existing accent style tag
              console.log('[COLOR DEBUG] InstantColorApply - Updating existing accent style tag:', existingAccentStyle.id);
              existingAccentStyle.textContent = accentStyleText;
            } else {
              console.log('[COLOR DEBUG] InstantColorApply - Creating new accent style tag');
              // Create new accent style tag
              var accentStyle = document.createElement('style');
              accentStyle.id = 'accent-color-session';
              accentStyle.textContent = accentStyleText;
              
              // Insert after primary color style
              if (document.head) {
                const primaryStyle = document.getElementById('primary-color-session') ||
                                    document.getElementById('primary-color-inline-server') ||
                                    document.getElementById('primary-color-client');
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
          console.error('[COLOR DEBUG] InstantColorApply - Error applying accent color:', e);
        }
      } else {
        console.log('[COLOR DEBUG] InstantColorApply - No saved accent color found');
      }
      // Log computed CSS values to verify colors are applied
      try {
        var computedStyle = window.getComputedStyle(document.documentElement);
        var brandH = computedStyle.getPropertyValue('--brand-h').trim();
        var brandS = computedStyle.getPropertyValue('--brand-s').trim();
        var brandL = computedStyle.getPropertyValue('--brand-l').trim();
        var primary = computedStyle.getPropertyValue('--primary').trim();
        console.log('[COLOR DEBUG] InstantColorApply - Computed CSS values:', {
          '--brand-h': brandH,
          '--brand-s': brandS,
          '--brand-l': brandL,
          '--primary': primary
        });
      } catch (e) {
        console.log('[COLOR DEBUG] InstantColorApply - Could not read computed styles:', e);
      }
      
      console.log('[COLOR DEBUG] InstantColorApply - Color restoration complete');
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

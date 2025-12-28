"use client";

import Script from "next/script";

export function InstantFontApply() {
  // Script that runs before React hydrates, using cookies and sessionStorage as fallback
  const scriptContent = `
    (function() {
      const scriptStartTime = performance.now();
      console.log('[PERF] 🔤 InstantFontApply - Script execution start');
      
      // Check if fonts were already applied by middleware or AdminFontStyle
      if (document.getElementById('font-family-inline') || 
          document.getElementById('font-family-blocking') || 
          document.getElementById('font-family-script')) {
        const alreadyAppliedDuration = performance.now() - scriptStartTime;
        console.log('[PERF] 🔤 InstantFontApply - Already applied: ' + alreadyAppliedDuration.toFixed(1) + 'ms');
        return; // Already applied
      }
      
      // Try to get fonts from cookie first (fastest, available immediately)
      const cookieReadStartTime = performance.now();
      let savedFonts = null;
      try {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
          const cookie = cookies[i].trim();
          if (cookie.startsWith('font-family-json=')) {
            const cookieValue = cookie.substring('font-family-json='.length);
            try {
              savedFonts = decodeURIComponent(cookieValue);
              // Validate it's valid JSON
              JSON.parse(savedFonts);
            } catch (e) {
              // Invalid JSON, ignore
              savedFonts = null;
            }
            break;
          }
        }
      } catch (e) {
        // Cookie parsing failed
      }
      const cookieReadDuration = performance.now() - cookieReadStartTime;
      console.log('[PERF] 🔤 InstantFontApply - Cookie read: ' + cookieReadDuration.toFixed(1) + 'ms (hasFonts: ' + !!savedFonts + ')');
      
      // Fallback to sessionStorage if no cookie
      if (!savedFonts) {
        const storageReadStartTime = performance.now();
        try {
          savedFonts = sessionStorage.getItem('font-family-json');
          // Validate it's valid JSON
          if (savedFonts) {
            JSON.parse(savedFonts);
          } else {
            savedFonts = null;
          }
        } catch (e) {
          // sessionStorage not available or invalid JSON
          savedFonts = null;
        }
        const storageReadDuration = performance.now() - storageReadStartTime;
        console.log('[PERF] 🔤 InstantFontApply - SessionStorage read: ' + storageReadDuration.toFixed(1) + 'ms (hasFonts: ' + !!savedFonts + ')');
      }
      
      if (savedFonts) {
        try {
          const fontApplyStartTime = performance.now();
          const fonts = JSON.parse(savedFonts);
          
          // Font ID to CSS variable mapping
          const fontVarMap = {
            'roboto': '--font-roboto',
            'open-sans': '--font-open-sans',
            'montserrat': '--font-montserrat',
            'dm-sans': '--font-dm-sans',
            'source-code-pro': '--font-source-code-pro',
            'space-grotesk': '--font-space-grotesk',
            'josefin-sans': '--font-josefin-sans',
            'rubik': '--font-rubik',
            'inter': '--font-inter',
            'poppins': '--font-poppins',
            'raleway': '--font-raleway',
            'nunito-sans': '--font-nunito-sans',
            'geist-sans': '--font-geist-sans',
            'geist-mono': '--font-geist-mono'
          };
          
          // Get CSS variables for admin fonts only
          const adminHeadingVar = fontVarMap[fonts.admin?.heading] || fontVarMap['geist-sans'];
          const adminBodyVar = fontVarMap[fonts.admin?.body] || fontVarMap['geist-sans'];
          
          // Do NOT set root-level CSS variables - only apply to html.preset-admin
          // This prevents affecting the landing page
          // Use universal selector to ensure fonts apply to ALL elements including buttons, inputs, etc.
          // Must be outside @layer to override Tailwind utilities
          // Set CSS variables on html.preset-admin so they're available to all children
          var style = document.createElement('style');
          style.id = 'font-family-session';
          style.textContent = 'html.preset-admin,html.preset-admin *{--font-family-admin-heading:var(' + adminHeadingVar + ');--font-family-admin-body:var(' + adminBodyVar + ');}html.preset-admin *,html.preset-admin *::before,html.preset-admin *::after{font-family:var(--font-family-admin-body),system-ui,sans-serif!important;}html.preset-admin h1,html.preset-admin h2,html.preset-admin h3,html.preset-admin h4,html.preset-admin h5,html.preset-admin h6,html.preset-admin h1 *,html.preset-admin h2 *,html.preset-admin h3 *,html.preset-admin h4 *,html.preset-admin h5 *,html.preset-admin h6 *{font-family:var(--font-family-admin-heading),system-ui,sans-serif!important;}';
          
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
          const fontApplyDuration = performance.now() - fontApplyStartTime;
          console.log('[PERF] 🔤 InstantFontApply - Font application: ' + fontApplyDuration.toFixed(1) + 'ms (DOM: ' + domManipDuration.toFixed(1) + 'ms)');
        } catch (e) {
          // Error applying fonts, ignore
          console.log('[PERF] 🔤 InstantFontApply - Font application (ERROR): ' + (e instanceof Error ? e.message : 'Unknown error'));
        }
      }
      
      const scriptTotalDuration = performance.now() - scriptStartTime;
      console.log('[PERF] 🔤 InstantFontApply - Total: ' + scriptTotalDuration.toFixed(1) + 'ms');
    })();
  `;

  return (
    <Script
      id="instant-font-apply"
      strategy="beforeInteractive"
      dangerouslySetInnerHTML={{ __html: scriptContent }}
    />
  );
}


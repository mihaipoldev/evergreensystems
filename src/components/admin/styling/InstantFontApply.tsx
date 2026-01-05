"use client";

import Script from "next/script";

/**
 * InstantFontApply - Applies static geist-sans font before React hydrates
 * Since admin fonts are now static (always geist-sans), this provides
 * early font application via inline script for instant font rendering.
 */
export function InstantFontApply() {
  const scriptContent = `
    (function() {
      // Check if fonts were already applied by middleware or AdminFontStyle
      if (document.getElementById('font-family-inline') || 
          document.getElementById('font-family-blocking') || 
          document.getElementById('font-family-script') ||
          document.getElementById('font-family-session')) {
        return; // Already applied
      }
      
      // Always use geist-sans for admin (static font)
      // Apply CSS directly to html.preset-admin elements
      var style = document.createElement('style');
      style.id = 'font-family-session';
      style.textContent = 'html.preset-admin,html.preset-admin *{--font-family-admin-heading:var(--font-nunito-sans);--font-family-admin-body:var(--font-nunito-sans);}html.preset-admin *,html.preset-admin *::before,html.preset-admin *::after{font-family:var(--font-nunito-sans),system-ui,sans-serif!important;}html.preset-admin h1,html.preset-admin h2,html.preset-admin h3,html.preset-admin h4,html.preset-admin h5,html.preset-admin h6,html.preset-admin h1 *,html.preset-admin h2 *,html.preset-admin h3 *,html.preset-admin h4 *,html.preset-admin h5 *,html.preset-admin h6 *{font-family:var(--font-nunito-sans),system-ui,sans-serif!important;}';
      
      // Insert immediately - this must be first in head
      if (document.head) {
        if (document.head.firstChild) {
          document.head.insertBefore(style, document.head.firstChild);
        } else {
          document.head.appendChild(style);
        }
      }
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


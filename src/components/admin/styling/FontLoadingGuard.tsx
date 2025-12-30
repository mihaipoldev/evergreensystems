"use client";

import Script from "next/script";

/**
 * FontLoadingGuard - Ensures preset-admin class is set
 * No longer hides content - just ensures proper class application
 */
export function FontLoadingGuard() {
  const scriptContent = `
    (function() {
      // Ensure preset-admin class is on html element (fallback if not set server-side)
      if (!document.documentElement.classList.contains('preset-admin')) {
        document.documentElement.classList.add('preset-admin');
      }
    })();
  `;

  return (
    <Script
      id="font-loading-guard"
      strategy="beforeInteractive"
      dangerouslySetInnerHTML={{ __html: scriptContent }}
    />
  );
}


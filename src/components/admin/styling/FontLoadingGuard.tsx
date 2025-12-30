"use client";

import Script from "next/script";

/**
 * FontLoadingGuard - Hides admin content until fonts are loaded
 * Runs before React hydrates to prevent FOUT (Flash of Unstyled Text)
 * Uses multiple independent timeouts to ensure content ALWAYS appears
 */
export function FontLoadingGuard() {
  const scriptContent = `
    (function() {
      // Ensure preset-admin class is on html element (fallback if not set server-side)
      if (!document.documentElement.classList.contains('preset-admin')) {
        document.documentElement.classList.add('preset-admin');
      }
      
      var hasShown = false;
      
      // Function to show content - can be called multiple times safely
      function showContent() {
        if (hasShown) return;
        hasShown = true;
        if (document.body) {
          document.body.classList.add('fonts-loaded');
          document.body.style.visibility = '';
        }
      }
      
      // MULTIPLE INDEPENDENT TIMEOUTS - at least one will fire
      // Timeout 1: Very short (100ms) - shows content quickly if fonts are fast
      setTimeout(showContent, 100);
      
      // Timeout 2: Medium (200ms) - backup if first fails
      setTimeout(showContent, 200);
      
      // Timeout 3: Longer (300ms) - final safety net
      setTimeout(showContent, 300);
      
      // Timeout 4: Maximum (500ms) - absolute guarantee
      setTimeout(showContent, 500);
      
      // Try to wait for fonts, but don't rely on it
      if (document.fonts && document.fonts.ready) {
        try {
          document.fonts.ready.then(function() {
            showContent();
          }).catch(function() {
            // Ignore errors, timeouts will handle it
          });
        } catch (e) {
          // Ignore errors, timeouts will handle it
        }
      }
      
      // DOMContentLoaded fallback
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', showContent);
      } else {
        // DOM already loaded
        showContent();
      }
      
      // Window load fallback (last resort)
      if (window.addEventListener) {
        window.addEventListener('load', showContent);
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


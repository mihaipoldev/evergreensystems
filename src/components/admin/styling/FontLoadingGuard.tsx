"use client";

import Script from "next/script";

/**
 * FontLoadingGuard - Hides admin content until fonts are loaded
 * Runs before React hydrates to prevent FOUT (Flash of Unstyled Text)
 */
export function FontLoadingGuard() {
  const scriptContent = `
    (function() {
      // Ensure preset-admin class is on html element (fallback if not set server-side)
      if (!document.documentElement.classList.contains('preset-admin')) {
        document.documentElement.classList.add('preset-admin');
      }
      
      // Hide body immediately if not already hidden
      if (!document.body.classList.contains('fonts-loaded')) {
        document.body.style.visibility = 'hidden';
      }
      
      var hasShown = false;
      
      // Wait for fonts to load
      function showContent() {
        if (hasShown) return;
        hasShown = true;
        document.body.classList.add('fonts-loaded');
        document.body.style.visibility = '';
      }
      
      // Safety timeout - ALWAYS show content after 500ms max
      // This ensures content is never hidden indefinitely
      var safetyTimeout = setTimeout(function() {
        showContent();
      }, 500);
      
      // Try to wait for fonts, but don't block if they don't load
      if (document.fonts && document.fonts.ready) {
        // Wait for fonts.ready with a race against the safety timeout
        Promise.race([
          document.fonts.ready,
          new Promise(function(resolve) {
            setTimeout(resolve, 400);
          })
        ]).then(function() {
          clearTimeout(safetyTimeout);
          showContent();
        }).catch(function() {
          clearTimeout(safetyTimeout);
          showContent();
        });
      } else {
        // No font API available, show immediately
        clearTimeout(safetyTimeout);
        setTimeout(showContent, 50);
      }
      
      // Also show on DOMContentLoaded as additional safety
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
          setTimeout(showContent, 100);
        });
      } else {
        // DOM already loaded, show after short delay
        setTimeout(showContent, 100);
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


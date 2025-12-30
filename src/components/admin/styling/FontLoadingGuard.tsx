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
      
      // Wait for fonts to load
      function showContent() {
        document.body.classList.add('fonts-loaded');
        document.body.style.visibility = '';
      }
      
      // Check if specific font is loaded (Inter/geist-sans)
      function checkFontLoaded() {
        if (document.fonts && document.fonts.check) {
          // Check if Inter font (geist-sans) is loaded
          // Inter is the font family name used by Next.js
          try {
            if (document.fonts.check('400 1em Inter') || 
                document.fonts.check('500 1em Inter') ||
                document.fonts.check('600 1em Inter') ||
                document.fonts.check('700 1em Inter')) {
              return true;
            }
          } catch (e) {
            // Font check failed, fall through to ready check
          }
        }
        return false;
      }
      
      // If font is already loaded, show immediately
      if (checkFontLoaded()) {
        showContent();
        return;
      }
      
      // Wait for fonts to load
      if (document.fonts && document.fonts.ready) {
        var fontCheckInterval = setInterval(function() {
          if (checkFontLoaded()) {
            clearInterval(fontCheckInterval);
            showContent();
          }
        }, 50);
        
        // Also listen to fonts.ready as backup
        document.fonts.ready.then(function() {
          clearInterval(fontCheckInterval);
          showContent();
        }).catch(function() {
          clearInterval(fontCheckInterval);
          // If font loading fails, show content after timeout
          setTimeout(showContent, 100);
        });
        
        // Safety timeout - show content after 3 seconds max
        setTimeout(function() {
          clearInterval(fontCheckInterval);
          showContent();
        }, 3000);
      } else {
        // Fallback: show content after short delay
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


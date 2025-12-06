"use client";

import Script from "next/script";

export function InstantFontApply() {
  // Script that runs before React hydrates, using cookies and sessionStorage as fallback
  const scriptContent = `
    (function() {
      // Check if fonts were already applied by middleware or AdminFontStyle
      if (document.getElementById('font-family-inline') || 
          document.getElementById('font-family-blocking') || 
          document.getElementById('font-family-script')) {
        return; // Already applied
      }
      
      // Try to get fonts from cookie first (fastest, available immediately)
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
      
      // Fallback to sessionStorage if no cookie
      if (!savedFonts) {
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
      }
      
      if (savedFonts) {
        try {
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
          
          const root = document.documentElement;
          root.style.setProperty('--font-family-admin-heading', 'var(' + adminHeadingVar + ')', 'important');
          root.style.setProperty('--font-family-admin-body', 'var(' + adminBodyVar + ')', 'important');
          
          // Inject style tag at the very beginning of head with maximum specificity
          var style = document.createElement('style');
          style.id = 'font-family-session';
          style.textContent = ':root{--font-family-admin-heading:var(' + adminHeadingVar + ');--font-family-admin-body:var(' + adminBodyVar + ');}html.preset-admin body,html.preset-admin body *,.preset-admin body,.preset-admin body *{font-family:var(' + adminBodyVar + '),system-ui,sans-serif!important;}html.preset-admin body h1,html.preset-admin body h2,html.preset-admin body h3,html.preset-admin body h4,html.preset-admin body h5,html.preset-admin body h6,.preset-admin h1,.preset-admin h2,.preset-admin h3,.preset-admin h4,.preset-admin h5,.preset-admin h6{font-family:var(' + adminHeadingVar + '),system-ui,sans-serif!important;}';
          
          // Insert immediately - this must be first in head
          if (document.head) {
            if (document.head.firstChild) {
              document.head.insertBefore(style, document.head.firstChild);
            } else {
              document.head.appendChild(style);
            }
          }
        } catch (e) {
          // Error applying fonts, ignore
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


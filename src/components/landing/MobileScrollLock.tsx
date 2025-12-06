"use client";

import { useEffect } from "react";

const MOBILE_BREAKPOINT = 768;

/**
 * MobileScrollLock - Prevents double scrollbar on mobile devices
 * 
 * This component locks html/body to exact viewport height on mobile
 * to prevent the double scrollbar issue. It uses window.innerHeight
 * to set exact pixel heights, ensuring no extra scrollable space.
 * 
 * CRITICAL: Only the body should scroll, not any nested containers.
 */
export function MobileScrollLock() {
  useEffect(() => {
    // Prevent html/body scrolling on mobile to avoid double scrollbar
    // Set html and body to exact viewport height with no overflow
    const setStyles = () => {
      const isMobile = window.innerWidth < MOBILE_BREAKPOINT;
      const vh = window.innerHeight;
      
      if (isMobile) {
        // Lock html to exact viewport height - NO SCROLLING
        document.documentElement.style.setProperty("overflow", "hidden", "important");
        document.documentElement.style.setProperty("height", `${vh}px`, "important");
        document.documentElement.style.setProperty("max-height", `${vh}px`, "important");
        // Ensure html doesn't scroll (this is critical)
        document.documentElement.style.setProperty("position", "relative", "important");
        
        // Lock body to exact viewport height, but allow vertical scrolling
        // This is the ONLY element that should scroll
        document.body.style.setProperty("overflow-x", "hidden", "important");
        document.body.style.setProperty("overflow-y", "auto", "important");
        document.body.style.setProperty("height", `${vh}px`, "important");
        document.body.style.setProperty("max-height", `${vh}px`, "important");
        document.body.style.setProperty("margin", "0", "important");
        document.body.style.setProperty("padding", "0", "important");
        document.body.style.setProperty("position", "relative", "important");
        // Ensure body can scroll smoothly
        document.body.style.setProperty("-webkit-overflow-scrolling", "touch", "important");
        // Ensure body is the scroll container
        document.body.style.setProperty("overscroll-behavior", "none", "important");
        
        // CRITICAL: Ensure all fixed elements stay fixed and are not affected
        // Find all fixed elements (like navbar) and ensure they remain fixed
        const fixedElements = document.querySelectorAll('[class*="fixed"], nav[class*="fixed"], [style*="position: fixed"]');
        fixedElements.forEach((el) => {
          if (el instanceof HTMLElement) {
            const computedStyle = window.getComputedStyle(el);
            if (computedStyle.position === 'fixed') {
              // Force fixed positioning to remain
              el.style.setProperty("position", "fixed", "important");
              el.style.setProperty("z-index", computedStyle.zIndex || "50", "important");
            }
          }
        });
        
        // CRITICAL: Prevent all nested containers from creating scroll contexts
        // Find the main wrapper div (first direct child of body)
        // BUT: Don't touch fixed elements like navbar
        const bodyChildren = Array.from(document.body.children);
        bodyChildren.forEach((child) => {
          if (child instanceof HTMLElement) {
            const computedStyle = window.getComputedStyle(child);
            const isFixed = computedStyle.position === 'fixed';
            const isNavbar = child.tagName === 'NAV' || 
                           child.classList.contains('fixed') ||
                           child.querySelector('nav[class*="fixed"]') !== null;
            
            // Don't touch fixed elements (like navbar)
            if (!isFixed && !isNavbar) {
              // Prevent any overflow on direct children of body
              child.style.setProperty("overflow", "visible", "important");
              child.style.setProperty("overflow-x", "hidden", "important");
              child.style.setProperty("overflow-y", "visible", "important");
              child.style.setProperty("height", "auto", "important");
              child.style.setProperty("max-height", "none", "important");
              // Ensure it doesn't create its own scroll context
              child.style.setProperty("position", "relative", "important");
            }
          }
        });
      } else {
        // On desktop, restore default behavior
        document.documentElement.style.removeProperty("overflow");
        document.documentElement.style.removeProperty("height");
        document.documentElement.style.removeProperty("max-height");
        document.body.style.removeProperty("overflow-x");
        document.body.style.removeProperty("overflow-y");
        document.body.style.removeProperty("height");
        document.body.style.removeProperty("max-height");
        document.body.style.removeProperty("margin");
        document.body.style.removeProperty("padding");
        document.body.style.removeProperty("position");
        
        // Restore nested containers
        const bodyChildren = Array.from(document.body.children);
        bodyChildren.forEach((child) => {
          if (child instanceof HTMLElement) {
            child.style.removeProperty("overflow");
            child.style.removeProperty("overflow-x");
            child.style.removeProperty("overflow-y");
            child.style.removeProperty("height");
            child.style.removeProperty("max-height");
            child.style.removeProperty("position");
          }
        });
      }
    };

    // Function to prevent nested scroll contexts
    // CRITICAL: Only body should scroll, no nested containers
    // Fixed elements (like navbar) must remain fixed and untouched
    const preventNestedScroll = () => {
      if (window.innerWidth < MOBILE_BREAKPOINT) {
        // Find all potential scroll containers and prevent them from scrolling
        const allElements = document.querySelectorAll('div, main, section, article, aside, header, footer');
        allElements.forEach((el) => {
          if (el instanceof HTMLElement && el !== document.body && el !== document.documentElement) {
            const computedStyle = window.getComputedStyle(el);
            // CRITICAL: Never touch fixed or absolute positioned elements (like navbar)
            const isFixed = computedStyle.position === 'fixed';
            const isAbsolute = computedStyle.position === 'absolute';
            const isSticky = computedStyle.position === 'sticky';
            
            // Also check if it's the navbar or any element with fixed positioning
            const isNavbar = el.classList.contains('fixed') || 
                           el.closest('[class*="fixed"]') !== null ||
                           computedStyle.position === 'fixed';
            
            if (!isFixed && !isAbsolute && !isSticky && !isNavbar) {
              // CRITICAL: Force all nested containers to not scroll
              // Even if content overflows, it should be handled by body scroll, not container scroll
              el.style.setProperty("overflow", "visible", "important");
              el.style.setProperty("overflow-x", "hidden", "important");
              el.style.setProperty("overflow-y", "visible", "important");
              // Ensure height is auto so content flows naturally
              if (computedStyle.height === '100vh' || computedStyle.height === '100%') {
                el.style.setProperty("height", "auto", "important");
              }
              if (computedStyle.maxHeight === '100vh' || computedStyle.maxHeight === '100%') {
                el.style.setProperty("max-height", "none", "important");
              }
            } else {
              // For fixed/absolute elements, ensure they're not affected by our scroll lock
              // Make sure they maintain their positioning
              if (isFixed || isNavbar) {
                // Ensure fixed elements stay fixed and are not affected
                el.style.setProperty("position", "fixed", "important");
              }
            }
          }
        });
      }
    };

    // Function to verify and fix scroll setup
    const verifyScrollSetup = () => {
      if (window.innerWidth < MOBILE_BREAKPOINT) {
        // Verify body is the scroll container
        const bodyStyle = window.getComputedStyle(document.body);
        const htmlStyle = window.getComputedStyle(document.documentElement);
        
        // Ensure html is locked
        if (htmlStyle.overflow !== 'hidden') {
          document.documentElement.style.setProperty("overflow", "hidden", "important");
        }
        
        // Ensure body can scroll
        if (bodyStyle.overflowY !== 'auto') {
          document.body.style.setProperty("overflow-y", "auto", "important");
        }
        
        // Find and fix any nested scroll containers (except fixed elements)
        const allDivs = document.querySelectorAll('div, main, section');
        allDivs.forEach((div) => {
          if (div instanceof HTMLElement && div !== document.body) {
            const style = window.getComputedStyle(div);
            const isFixed = style.position === 'fixed';
            const isNavbar = div.tagName === 'NAV' || div.closest('nav') !== null;
            
            // If it's scrollable and not fixed/navbar, fix it
            if (!isFixed && !isNavbar && (style.overflowY === 'auto' || style.overflowY === 'scroll')) {
              div.style.setProperty("overflow", "visible", "important");
              div.style.setProperty("overflow-y", "visible", "important");
            }
          }
        });
        
        // Ensure all fixed elements (especially navbar) stay fixed
        const fixedElements = document.querySelectorAll('nav, [class*="fixed"]');
        fixedElements.forEach((el) => {
          if (el instanceof HTMLElement) {
            const style = window.getComputedStyle(el);
            if (style.position === 'fixed' || el.classList.contains('fixed')) {
              el.style.setProperty("position", "fixed", "important");
            }
          }
        });
      }
    };

    // Use multiple requestAnimationFrame calls to ensure DOM is fully ready
    // This is critical for Next.js hydration
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setStyles();
        preventNestedScroll();
        verifyScrollSetup();
        // Also run after a small delay to catch any late-rendering content
        setTimeout(() => {
          setStyles();
          preventNestedScroll();
          verifyScrollSetup();
        }, 100);
        // Run again after a longer delay to catch lazy-loaded content
        setTimeout(() => {
          setStyles();
          preventNestedScroll();
          verifyScrollSetup();
        }, 500);
      });
    });

    // Also set on resize to prevent any height changes
    window.addEventListener("resize", () => {
      setStyles();
      preventNestedScroll();
    });
    // Also listen to orientation changes
    window.addEventListener("orientationchange", () => {
      // Small delay to ensure viewport has updated
      setTimeout(() => {
        setStyles();
        preventNestedScroll();
      }, 100);
    });

    // Watch for DOM changes (like lazy-loaded content)
    const observer = new MutationObserver(() => {
      if (window.innerWidth < MOBILE_BREAKPOINT) {
        preventNestedScroll();
        verifyScrollSetup();
      }
    });

    // Start observing
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class']
    });

    return () => {
      // Clean up when component unmounts
      window.removeEventListener("resize", setStyles);
      window.removeEventListener("orientationchange", setStyles);
      observer.disconnect();
      
      // Restore scrolling when component unmounts
      document.documentElement.style.removeProperty("overflow");
      document.documentElement.style.removeProperty("height");
      document.documentElement.style.removeProperty("max-height");
      document.body.style.removeProperty("overflow-x");
      document.body.style.removeProperty("overflow-y");
      document.body.style.removeProperty("height");
      document.body.style.removeProperty("max-height");
      document.body.style.removeProperty("margin");
      document.body.style.removeProperty("padding");
      document.body.style.removeProperty("position");
      
      // Restore nested containers
      const bodyChildren = Array.from(document.body.children);
      bodyChildren.forEach((child) => {
        if (child instanceof HTMLElement) {
          child.style.removeProperty("overflow");
          child.style.removeProperty("overflow-x");
          child.style.removeProperty("overflow-y");
          child.style.removeProperty("height");
          child.style.removeProperty("max-height");
          child.style.removeProperty("position");
        }
      });
      
      // Restore all elements
      const allElements = document.querySelectorAll('div, main, section, article, aside');
      allElements.forEach((el) => {
        if (el instanceof HTMLElement) {
          el.style.removeProperty("overflow-y");
          el.style.removeProperty("overflow-x");
        }
      });
    };
  }, []);

  return null; // This component doesn't render anything
}

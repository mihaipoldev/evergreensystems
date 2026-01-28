"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function StylePresetProvider() {
  const pathname = usePathname();

  useEffect(() => {
    // Safety check for client-side only
    if (typeof window === "undefined" || typeof document === "undefined") {
      return;
    }

    const htmlElement = document.documentElement;
    
    // Determine which preset should be active based on pathname
    const shouldBeAdmin = pathname?.startsWith("/admin") || pathname?.startsWith("/intel");
    const shouldBeOutbound = pathname === "/outbound-system";
    const shouldBeLanding = !shouldBeAdmin && !shouldBeOutbound;
    
    // Check current state to avoid unnecessary DOM manipulation
    const hasAdmin = htmlElement.classList.contains("preset-admin");
    const hasLanding = htmlElement.classList.contains("preset-landing-page");
    const hasOutbound = htmlElement.classList.contains("preset-outbound-system");
    
    // Only update if the preset class needs to change
    // This prevents resetting colors/styles unnecessarily on refresh
    if (shouldBeAdmin) {
      // Should have admin preset
      if (!hasAdmin || hasLanding || hasOutbound) {
        // Need to add admin or remove other presets
        htmlElement.classList.remove("preset-landing-page", "preset-outbound-system");
        htmlElement.classList.add("preset-admin");
      }
    } else if (shouldBeOutbound) {
      // Should have outbound preset
      if (!hasOutbound || hasAdmin || hasLanding) {
        // Need to add outbound or remove other presets
        htmlElement.classList.remove("preset-admin", "preset-landing-page");
        htmlElement.classList.add("preset-outbound-system");
      }
    } else {
      // Should have landing preset (default)
      if (!hasLanding || hasAdmin || hasOutbound) {
        // Need to add landing or remove other presets
        htmlElement.classList.remove("preset-admin", "preset-outbound-system");
        htmlElement.classList.add("preset-landing-page");
      }
    }
  }, [pathname]);

  return null;
}


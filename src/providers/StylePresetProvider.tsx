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
    
    // Remove all preset classes
    htmlElement.classList.remove("preset-admin", "preset-landing-page");
    
    // Apply the appropriate preset based on the pathname
    if (pathname?.startsWith("/admin") || pathname?.startsWith("/intel")) {
      htmlElement.classList.add("preset-admin");
    } else {
      // Default to landing-page preset for all other routes
      htmlElement.classList.add("preset-landing-page");
    }
  }, [pathname]);

  return null;
}


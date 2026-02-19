"use client";

import { usePathname } from "next/navigation";
import { useLayoutEffect } from "react";
import { isFunnelRoute, getFunnelPresetClass } from "@/features/funnels/routes";

export function StylePresetProvider() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    // Safety check for client-side only
    if (typeof window === "undefined" || typeof document === "undefined") {
      return;
    }

    const htmlElement = document.documentElement;

    // Determine which preset should be active based on pathname
    const shouldBeAdmin = pathname?.startsWith("/admin") || pathname?.startsWith("/intel");
    const isFunnel = !shouldBeAdmin && pathname ? isFunnelRoute(pathname) : false;
    const targetPreset = shouldBeAdmin
      ? "preset-admin"
      : isFunnel
        ? getFunnelPresetClass(pathname!)
        : "preset-landing-page";

    // Check if the target preset is already active
    if (htmlElement.classList.contains(targetPreset)) {
      return;
    }

    // Remove all preset classes and add the correct one
    const currentClasses = Array.from(htmlElement.classList).filter((c) =>
      c.startsWith("preset-")
    );
    currentClasses.forEach((c) => htmlElement.classList.remove(c));
    htmlElement.classList.add(targetPreset);
  }, [pathname]);

  return null;
}


"use client";

import { usePathname } from "next/navigation";
import { FloatingProgressIndicator } from "./FloatingProgressIndicator";

/**
 * Client wrapper for FloatingProgressIndicator.
 * Renders the active-runs indicator only on Intel routes (/intel/*),
 * so it is not visible on the landing page or other public pages.
 */
export function FloatingProgressIndicatorWrapper() {
  const pathname = usePathname();
  const isIntelRoute = pathname?.startsWith("/intel") ?? false;

  if (!isIntelRoute) return null;

  return <FloatingProgressIndicator />;
}


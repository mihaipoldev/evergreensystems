"use client";

import { FloatingProgressIndicator } from "./FloatingProgressIndicator";

/**
 * Client wrapper for FloatingProgressIndicator
 * Needed because layout.tsx is a server component
 */
export function FloatingProgressIndicatorWrapper() {
  return <FloatingProgressIndicator />;
}


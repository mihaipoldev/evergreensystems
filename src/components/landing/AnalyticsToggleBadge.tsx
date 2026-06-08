"use client";

import { useEffect, useState } from "react";
import type { AnalyticsMode } from "@/lib/analytics";

// Tiny, dependency-free indicator of this browser's analytics opt-out state.
// Hidden in the normal "default" mode; shows a subtle persistent pill when the
// browser is excluded ("off") or forced on ("on"), plus a brief "updated" flash
// right after the URL toggle is applied. Inline styles only, so it renders the
// same regardless of any page's CSS scope.
export function AnalyticsToggleBadge({ mode, flash }: { mode: AnalyticsMode; flash: boolean }) {
  const [showFlash, setShowFlash] = useState(flash);

  useEffect(() => {
    if (!flash) return;
    setShowFlash(true);
    const t = setTimeout(() => setShowFlash(false), 4000);
    return () => clearTimeout(t);
  }, [flash]);

  if (mode === "default" && !showFlash) return null;

  const dot = mode === "off" ? "#e5564b" : mode === "on" ? "#28c840" : "#97A0AB";
  const label =
    mode === "off"
      ? "analytics off · this browser"
      : mode === "on"
        ? "analytics on · forced"
        : "analytics default";

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        bottom: 12,
        left: 12,
        zIndex: 2147483000,
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "6px 11px",
        borderRadius: 999,
        background: "rgba(12,35,64,0.88)",
        color: "#fff",
        font: "500 11px/1 ui-monospace, SFMono-Regular, Menlo, monospace",
        letterSpacing: "0.04em",
        boxShadow: "0 4px 14px rgba(0,0,0,0.18)",
        opacity: showFlash ? 1 : 0.5,
        transition: "opacity 240ms ease",
        pointerEvents: "none",
        userSelect: "none",
      }}
    >
      <span
        style={{ width: 7, height: 7, borderRadius: "50%", background: dot, flex: "none" }}
      />
      {label}
      {showFlash ? " · updated" : ""}
    </div>
  );
}

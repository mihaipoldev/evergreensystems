// Minimal user-agent → device classification, no dependency. Good-enough
// buckets for the analytics dashboard: device type, OS, browser. Parsed
// server-side at insert time and stored in metadata.device, so the dashboard
// never has to parse raw UA strings.

export interface DeviceInfo {
  type: "mobile" | "tablet" | "desktop";
  os: string;
  browser: string;
}

export function parseDevice(ua: string | null): DeviceInfo | null {
  if (!ua) return null;

  const isTablet =
    /iPad|Tablet|PlayBook|Silk/i.test(ua) ||
    (/Android/i.test(ua) && !/Mobile/i.test(ua));
  const isMobile =
    !isTablet && /Mobi|iPhone|iPod|Android|Windows Phone/i.test(ua);
  const type = isTablet ? "tablet" : isMobile ? "mobile" : "desktop";

  // Order matters: iOS before macOS (iPhone UAs contain "Mac OS X"),
  // Android before Linux. Note: iPadOS desktop-mode UAs are indistinguishable
  // from macOS — those count as desktop/macOS.
  const os = /iPhone|iPad|iPod/i.test(ua)
    ? "iOS"
    : /Android/i.test(ua)
      ? "Android"
      : /Windows NT|Windows Phone/i.test(ua)
        ? "Windows"
        : /Mac OS X|Macintosh/i.test(ua)
          ? "macOS"
          : /Linux/i.test(ua)
            ? "Linux"
            : "other";

  // Order matters: Edge/Opera/Samsung identify as Chrome too; CriOS/FxiOS are
  // Chrome/Firefox on iOS.
  const browser = /Edg\//i.test(ua)
    ? "Edge"
    : /OPR\/|Opera/i.test(ua)
      ? "Opera"
      : /SamsungBrowser/i.test(ua)
        ? "Samsung"
        : /Chrome\/|CriOS/i.test(ua)
          ? "Chrome"
          : /Firefox\/|FxiOS/i.test(ua)
            ? "Firefox"
            : /Safari\//i.test(ua)
              ? "Safari"
              : "other";

  return { type, os, browser };
}

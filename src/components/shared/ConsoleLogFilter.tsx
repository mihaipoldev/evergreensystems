"use client";

import Script from "next/script";

/**
 * Component that filters out Fast Refresh logs from the console
 * Uses a script tag to run before React hydrates, catching all logs
 */
export function ConsoleLogFilter() {
  // Only filter in development
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  const scriptContent = `
    (function() {
      // Store original console methods
      const originalLog = console.log;
      const originalInfo = console.info;
      
      // Override console.log to filter Fast Refresh messages
      console.log = function(...args) {
        const message = args[0]?.toString() || "";
        // Filter out Fast Refresh messages
        if (message.includes("[Fast Refresh]")) {
          return;
        }
        originalLog.apply(console, args);
      };
      
      // Override console.info to filter Fast Refresh messages
      console.info = function(...args) {
        const message = args[0]?.toString() || "";
        // Filter out Fast Refresh messages
        if (message.includes("[Fast Refresh]")) {
          return;
        }
        originalInfo.apply(console, args);
      };
    })();
  `;

  return (
    <Script
      id="console-log-filter"
      strategy="beforeInteractive"
      dangerouslySetInnerHTML={{ __html: scriptContent }}
    />
  );
}


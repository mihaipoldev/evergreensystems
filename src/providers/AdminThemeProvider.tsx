"use client";

import { ThemeProvider } from "next-themes";
import { ReactNode, useEffect, useRef } from "react";
import { getTimestamp, getDuration, debugClientTiming } from "@/lib/debug-performance";

export function AdminThemeProvider({ children }: { children: ReactNode }) {
  const initStartTime = useRef<number>(getTimestamp());

  useEffect(() => {
    const initDuration = getDuration(initStartTime.current);
    debugClientTiming("AdminThemeProvider", "Initialization", initDuration);
    
    // Measure storage read
    const storageReadStartTime = getTimestamp();
    try {
      const storedTheme = localStorage.getItem("admin-theme");
      const storageReadDuration = getDuration(storageReadStartTime);
      debugClientTiming("AdminThemeProvider", "Storage read", storageReadDuration, {
        hasStoredTheme: !!storedTheme,
        theme: storedTheme || 'default'
      });
    } catch (error) {
      const storageReadDuration = getDuration(storageReadStartTime);
      debugClientTiming("AdminThemeProvider", "Storage read (ERROR)", storageReadDuration, {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }, []);

  return (
    <ThemeProvider 
      attribute="class" 
      defaultTheme="light" 
      enableSystem={false}
      storageKey="admin-theme"
      disableTransitionOnChange={false}
    >
      {children}
    </ThemeProvider>
  );
}





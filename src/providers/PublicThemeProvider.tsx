"use client";

import { ThemeProvider } from "next-themes";
import { ReactNode } from "react";

export function PublicThemeProvider({ 
  children,
  initialTheme = "dark"
}: { 
  children: ReactNode;
  initialTheme?: string;
}) {
  // Determine if we should use forcedTheme or enable system
  const forcedTheme = initialTheme === "system" ? undefined : initialTheme;
  const enableSystem = initialTheme === "system";

  return (
    <ThemeProvider 
      attribute="class" 
      forcedTheme={forcedTheme}
      enableSystem={enableSystem}
      defaultTheme={initialTheme === "system" ? undefined : initialTheme}
      storageKey="public-theme"
      disableTransitionOnChange={false}
    >
      {children}
    </ThemeProvider>
  );
}


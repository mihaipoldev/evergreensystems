"use client";

import { ThemeProvider } from "next-themes";
import { ReactNode } from "react";

export function PublicThemeProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider 
      attribute="class" 
      forcedTheme="dark"
      enableSystem={false}
      storageKey="public-theme"
      disableTransitionOnChange={false}
    >
      {children}
    </ThemeProvider>
  );
}


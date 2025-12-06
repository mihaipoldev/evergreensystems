"use client";

import { ThemeProvider } from "next-themes";
import { ReactNode } from "react";

export function AdminThemeProvider({ children }: { children: ReactNode }) {
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

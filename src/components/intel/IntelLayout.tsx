"use client";

import { IntelSidebar } from "./IntelSidebar";
import { AdminHeader } from "@/components/admin/layout/AdminHeader";
import { AdminFooter } from "@/components/shared/AdminFooter";
import { NavigationLoadingProvider } from "@/providers/NavigationLoadingProvider";
import { AdminThemeProvider } from "@/providers/AdminThemeProvider";
import { QueryClientProvider } from "@/providers/QueryClientProvider";
import { PageTransitionLoader } from "@/components/admin/layout/PageTransitionLoader";
import { ChatProvider, ChatEdgeIndicator, ChatSidebar } from "@/features/chat";
import { useEffect, useRef } from "react";
import { getTimestamp, getDuration, debugClientTiming } from "@/lib/debug-performance";
import { usePathname } from "next/navigation";

export function IntelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const showBackgroundGradient = false; // pathname === "/intel/dashboard";
  const mountStartTime = useRef<number>(getTimestamp());
  const providersInitTime = useRef<number | null>(null);
  const firstRenderTime = useRef<number | null>(null);

  useEffect(() => {
    const mountDuration = getDuration(mountStartTime.current);
    debugClientTiming("IntelLayout", "Mount", mountDuration);
    
    providersInitTime.current = getTimestamp();
    // Small delay to measure provider initialization
    setTimeout(() => {
      if (providersInitTime.current) {
        const providersDuration = getDuration(providersInitTime.current);
        debugClientTiming("IntelLayout", "Providers init", providersDuration);
      }
      
      firstRenderTime.current = getTimestamp();
      // Measure first render completion
      requestAnimationFrame(() => {
        if (firstRenderTime.current) {
          const firstRenderDuration = getDuration(firstRenderTime.current);
          debugClientTiming("IntelLayout", "First render", firstRenderDuration);
        }
      });
    }, 0);
  }, []);

  return (
    <QueryClientProvider>
      <AdminThemeProvider>
        <NavigationLoadingProvider>
          <ChatProvider>
            {/* Body scroll (single scroll), sidebar fixed on desktop; prevent horizontal scroll */}
            <div className="relative flex min-h-screen bg-background overflow-x-hidden">
              <IntelSidebar />
              <div className="relative flex flex-1 flex-col md:pl-64 min-w-0">
                <AdminHeader />
                <main className="flex flex-1 flex-col min-w-0 px-4 md:px-6 lg:px-8 relative">
                  {showBackgroundGradient && (
                    <>
                      {/* Background gradient overlays */}
                      <div className="absolute inset-0 z-0 bg-gradient-to-br from-primary/8 via-primary/3 to-primary/5 pointer-events-none" />
                      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top_right,_hsl(var(--primary)/0.2),_transparent_70%)] pointer-events-none" />
                      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_bottom_left,_hsl(var(--primary)/0.1),_transparent_60%)] pointer-events-none" />
                    </>
                  )}
                  <div className="mx-auto w-full max-w-[1400px] flex flex-col min-w-0 pt-[56px] md:pt-[81px] relative z-10">
                    <div className="relative flex flex-col pb-0 space-y-4 pt-0 md:pt-2 md:space-y-6 min-w-0">
                      {children}
                    </div>
                  </div>
                </main>
                <AdminFooter />
                <PageTransitionLoader />
              </div>
              <ChatEdgeIndicator />
              <ChatSidebar />
            </div>
          </ChatProvider>
        </NavigationLoadingProvider>
      </AdminThemeProvider>
    </QueryClientProvider>
  );
}


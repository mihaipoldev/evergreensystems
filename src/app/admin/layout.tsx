"use client";

import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { NavigationLoadingProvider } from "@/providers/NavigationLoadingProvider";
import { AdminThemeProvider } from "@/providers/AdminThemeProvider";
import { QueryClientProvider } from "@/providers/QueryClientProvider";
import { PageTransitionLoader } from "@/components/admin/PageTransitionLoader";
import { useEffect, useRef } from "react";
import { getTimestamp, getDuration, debugClientTiming } from "@/lib/debug-performance";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const mountStartTime = useRef<number>(getTimestamp());
  const providersInitTime = useRef<number | null>(null);
  const firstRenderTime = useRef<number | null>(null);

  useEffect(() => {
    const mountDuration = getDuration(mountStartTime.current);
    debugClientTiming("AdminLayout", "Mount", mountDuration);
    
    providersInitTime.current = getTimestamp();
    // Small delay to measure provider initialization
    setTimeout(() => {
      if (providersInitTime.current) {
        const providersDuration = getDuration(providersInitTime.current);
        debugClientTiming("AdminLayout", "Providers init", providersDuration);
      }
      
      firstRenderTime.current = getTimestamp();
      // Measure first render completion
      requestAnimationFrame(() => {
        if (firstRenderTime.current) {
          const firstRenderDuration = getDuration(firstRenderTime.current);
          debugClientTiming("AdminLayout", "First render", firstRenderDuration);
        }
      });
    }, 0);
  }, []);

  return (
    <QueryClientProvider>
      <AdminThemeProvider>
        <NavigationLoadingProvider>
          {/* Body scroll (single scroll), sidebar fixed on desktop; prevent horizontal scroll */}
          <div className="relative flex min-h-screen bg-background overflow-x-hidden">
            <AdminSidebar />
            <div className="flex flex-1 flex-col md:pl-64 min-w-0">
                  <AdminHeader />
              <main className="flex flex-1 flex-col min-w-0">
                <div className="mx-auto w-full max-w-[1400px] flex flex-col min-w-0 pt-[40px] md:pt-[84px] pb-12 md:pb-0">
                  <div className="relative flex flex-col py-6 pb-4 md:pb-8 px-4 md:px-10 lg:px-12 space-y-4 md:space-y-6 min-w-0">
                    {children}
                    <PageTransitionLoader />
                  </div>
                </div>
              </main>
            </div>
          </div>
        </NavigationLoadingProvider>
      </AdminThemeProvider>
    </QueryClientProvider>
  );
}

"use client";

import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { NavigationLoadingProvider } from "@/providers/NavigationLoadingProvider";
import { AdminTeamProvider } from "@/providers/AdminTeamProvider";
import { AdminThemeProvider } from "@/providers/AdminThemeProvider";
import { QueryClientProvider } from "@/providers/QueryClientProvider";
import { PageTransitionLoader } from "@/components/admin/PageTransitionLoader";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryClientProvider>
      <AdminThemeProvider>
        <NavigationLoadingProvider>
          <AdminTeamProvider>
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
          </AdminTeamProvider>
        </NavigationLoadingProvider>
      </AdminThemeProvider>
    </QueryClientProvider>
  );
}

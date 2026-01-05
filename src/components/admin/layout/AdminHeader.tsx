"use client";

import { SidebarTrigger } from "./sidebar/SidebarTrigger";
import { ThemeToggle } from "@/components/admin/styling/ThemeToggle";
import { AdminBreadcrumb } from "./AdminBreadcrumb";
import { IntelPageTitle } from "@/components/intel/IntelPageTitle";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { getTimestamp, getDuration, debugClientTiming } from "@/lib/debug-performance";

export function AdminHeader() {
  const mountStartTime = useRef<number>(getTimestamp());
  const pathname = usePathname();
  const isIntelRoute = pathname?.startsWith("/intel") ?? false;
  
  useEffect(() => {
    const mountDuration = getDuration(mountStartTime.current);
    debugClientTiming("AdminHeader", "Mount", mountDuration);
  }, []);
  
  return (
    <header className={cn(
      "ml-0 md:ml-64 fixed top-0 left-0 right-0 z-50 flex h-[40px] md:h-[81px] items-center gap-2 bg-background",
      isIntelRoute ? "px-4 md:px-6 lg:px-8" : "px-4 md:px-10 lg:px-12 border-b border-border/50"
    )}>
      <div className="flex items-center gap-2 w-full max-w-[1400px] mx-auto">
        <div className="flex items-center gap-2">
          <SidebarTrigger />
          {isIntelRoute ? <IntelPageTitle /> : <AdminBreadcrumb />}
        </div>
        <div className="ml-auto">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}


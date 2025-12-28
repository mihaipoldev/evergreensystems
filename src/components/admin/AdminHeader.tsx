"use client";

import { AdminSidebarMobile } from "./AdminSidebarMobile";
import { ThemeToggle } from "./ThemeToggle";
import { AdminBreadcrumb } from "./AdminBreadcrumb";
import { useEffect, useRef } from "react";
import { getTimestamp, getDuration, debugClientTiming } from "@/lib/debug-performance";

export function AdminHeader() {
  const mountStartTime = useRef<number>(getTimestamp());
  
  useEffect(() => {
    const mountDuration = getDuration(mountStartTime.current);
    debugClientTiming("AdminHeader", "Mount", mountDuration);
  }, []);
  
  return (
    <header className="ml-0 border-l md:ml-64 fixed top-0 left-0 right-0 z-30 flex h-[40px] md:h-[81px] items-center gap-2 bg-background/85 backdrop-blur supports-[backdrop-filter]:backdrop-blur border-b border-border/50 px-4 md:px-10 lg:px-12 backdrop-blur-sm backdrop-blur-sm backdrop-blur-sm">
      <div className="flex items-center gap-2 w-full max-w-[1400px] mx-auto">
        <div className="flex items-center gap-2">
          <AdminSidebarMobile />
          <AdminBreadcrumb />
        </div>
        <div className="ml-auto">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}


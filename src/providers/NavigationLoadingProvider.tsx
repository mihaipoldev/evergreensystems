"use client";

import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { usePathname } from "next/navigation";
import { getTimestamp, getDuration, debugClientTiming } from "@/lib/debug-performance";

interface NavigationLoadingContextType {
  isNavigating: boolean;
  pendingPath: string | null;
  startNavigation: (path: string) => void;
}

const NavigationLoadingContext = createContext<NavigationLoadingContextType | undefined>(undefined);

export function NavigationLoadingProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = useState(false);
  const [pendingPath, setPendingPath] = useState<string | null>(null);
  const navigationStartTime = useRef<number | null>(null);

  const startNavigation = useCallback((path: string) => {
    navigationStartTime.current = getTimestamp();
    debugClientTiming("NavigationLoadingProvider", "Navigation start", 0, { path });
    setPendingPath(path);
    setIsNavigating(true);
  }, []);

  // Clear navigation state when pathname changes
  // Compare pathname without query params to handle query param updates
  useEffect(() => {
    if (pendingPath) {
      // Remove query params from both for comparison
      const pathnameWithoutQuery = pathname.split('?')[0];
      const pendingPathWithoutQuery = pendingPath.split('?')[0];
      
      if (pathnameWithoutQuery === pendingPathWithoutQuery) {
        if (navigationStartTime.current) {
          const navigationDuration = getDuration(navigationStartTime.current);
          debugClientTiming("NavigationLoadingProvider", "Navigation complete", navigationDuration, {
            from: pendingPath,
            to: pathname
          });
          navigationStartTime.current = null;
        }
        setIsNavigating(false);
        setPendingPath(null);
      }
    }
    // Also clear if pathname changes but no pending path (handles query param-only updates)
    else if (isNavigating) {
      if (navigationStartTime.current) {
        const navigationDuration = getDuration(navigationStartTime.current);
        debugClientTiming("NavigationLoadingProvider", "Navigation complete (no pending)", navigationDuration, {
          pathname
        });
        navigationStartTime.current = null;
      }
      setIsNavigating(false);
    }
  }, [pathname, pendingPath, isNavigating]);

  return (
    <NavigationLoadingContext.Provider value={{ isNavigating, pendingPath, startNavigation }}>
      {children}
    </NavigationLoadingContext.Provider>
  );
}

export function useNavigationLoading() {
  const context = useContext(NavigationLoadingContext);
  if (context === undefined) {
    throw new Error("useNavigationLoading must be used within NavigationLoadingProvider");
  }
  return context;
}

"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { usePathname } from "next/navigation";

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

  const startNavigation = useCallback((path: string) => {
    setPendingPath(path);
    setIsNavigating(true);
  }, []);

  // Clear navigation state when pathname changes
  useEffect(() => {
    if (pendingPath && pathname === pendingPath) {
      setIsNavigating(false);
      setPendingPath(null);
    }
  }, [pathname, pendingPath]);

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

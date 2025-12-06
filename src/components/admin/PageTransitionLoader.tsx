"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { useNavigationLoading } from "@/providers/NavigationLoadingProvider";
import { useEffect, useState } from "react";

export function PageTransitionLoader() {
  const { isNavigating } = useNavigationLoading();
  const [show, setShow] = useState(false);

  // Add a small delay before showing loader to avoid flash for fast navigations
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    if (isNavigating) {
      // Show loader after 100ms to avoid flash for instant navigations
      timeout = setTimeout(() => {
        setShow(true);
      }, 100);
    } else {
      setShow(false);
    }

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [isNavigating]);

  if (!show) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="flex flex-col items-center gap-3">
        <FontAwesomeIcon 
          icon={faSpinner} 
          className="h-8 w-8 text-primary animate-spin" 
        />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

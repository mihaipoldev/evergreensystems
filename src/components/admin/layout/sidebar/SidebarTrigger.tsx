"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

// Module-level state for sharing Sheet state between AdminSidebar and SidebarTrigger
let sidebarOpenState = false;
const sidebarStateListeners = new Set<(open: boolean) => void>();

function setSidebarOpen(open: boolean) {
  sidebarOpenState = open;
  sidebarStateListeners.forEach(listener => listener(open));
}

function useSidebarState() {
  const [isOpen, setIsOpen] = useState(sidebarOpenState);
  
  useEffect(() => {
    const listener = (open: boolean) => setIsOpen(open);
    sidebarStateListeners.add(listener);
    return () => {
      sidebarStateListeners.delete(listener);
    };
  }, []);
  
  return [isOpen, (open: boolean) => {
    setSidebarOpen(open);
    setIsOpen(open);
  }] as const;
}

// Export the setter for use in AdminSidebar
export function setSidebarOpenState(open: boolean) {
  setSidebarOpen(open);
}

export function useSidebarOpenState() {
  return useSidebarState();
}

// Export trigger component for use in AdminHeader
export function SidebarTrigger() {
  const [, setIsOpen] = useSidebarState();
  
  return (
    <Button 
      variant="ghost" 
      size="icon" 
      className="md:hidden touch-safe-button bg-transparent active:bg-transparent focus-visible:bg-transparent"
      onClick={() => setIsOpen(true)}
      onMouseLeave={(e) => {
        // Force remove hover state on mouse leave
        e.currentTarget.blur();
      }}
      onTouchEnd={(e) => {
        // Force remove focus/hover state after touch
        e.currentTarget.blur();
      }}
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" data-slot="icon" className="!h-6 !w-6 pointer-events-none">
        <path fillRule="evenodd" d="M3 6.75A.75.75 0 0 1 3.75 6h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 6.75ZM3 12a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 12Zm0 5.25a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
      </svg>
      <span className="sr-only">Toggle menu</span>
    </Button>
  );
}


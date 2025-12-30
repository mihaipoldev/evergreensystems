"use client";

import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";
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
      className="md:hidden"
      onClick={() => setIsOpen(true)}
    >
      <FontAwesomeIcon icon={faBars} className="h-5 w-5" />
      <span className="sr-only">Toggle menu</span>
    </Button>
  );
}


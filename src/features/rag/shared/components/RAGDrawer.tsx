"use client";

import React, { useEffect, useRef } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface RAGDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  side?: "left" | "right" | "top" | "bottom";
  className?: string;
}

export function RAGDrawer({
  open,
  onOpenChange,
  title,
  children,
  footer,
  side = "right",
  className,
}: RAGDrawerProps) {
  const overlayElementRef = useRef<HTMLDivElement | null>(null);

  // Create a custom overlay that covers the entire viewport when drawer opens
  useEffect(() => {
    if (!open) {
      // Remove custom overlay when drawer closes
      if (overlayElementRef.current && overlayElementRef.current.parentNode) {
        overlayElementRef.current.parentNode.removeChild(overlayElementRef.current);
        overlayElementRef.current = null;
      }
      return;
    }

    // Check if overlay already exists (in case drawer was already open)
    let overlay = overlayElementRef.current;
    
    if (!overlay) {
      // Create overlay element directly in document.body
      overlay = document.createElement('div');
      overlay.setAttribute('data-drawer-overlay', 'true');
      document.body.appendChild(overlay);
      overlayElementRef.current = overlay;
    }

    // Set styles (update if already exists)
    overlay.style.cssText = `
      position: fixed;
      inset: 0;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      width: 100vw;
      height: 100vh;
      z-index: 105;
      background-color: rgba(0, 0, 0, 0.5);
      pointer-events: none;
    `;

    return () => {
      if (overlayElementRef.current && overlayElementRef.current.parentNode) {
        overlayElementRef.current.parentNode.removeChild(overlayElementRef.current);
        overlayElementRef.current = null;
      }
    };
  }, [open]);

  // Set z-index on drawer content when it opens
  useEffect(() => {
    if (!open) return;

    const updateZIndex = () => {
      const drawerContent = document.querySelector('.rag-drawer-content') as HTMLElement;
      if (drawerContent) {
        drawerContent.style.setProperty('z-index', '110', 'important');
      }
    };

    // Use MutationObserver to watch for DOM changes
    const observer = new MutationObserver(updateZIndex);
    observer.observe(document.body, { childList: true, subtree: true });

    // Also call immediately and with delays
    updateZIndex();
    const timeout1 = setTimeout(updateZIndex, 10);
    const timeout2 = setTimeout(updateZIndex, 50);
    const timeout3 = setTimeout(updateZIndex, 100);

    return () => {
      observer.disconnect();
      clearTimeout(timeout1);
      clearTimeout(timeout2);
      clearTimeout(timeout3);
    };
  }, [open]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={side}
        showOverlay={false}
        className={cn("rag-drawer-content shadow-card border-0 w-full sm:max-w-[600px] flex flex-col !z-[110]", className)}
        style={{ zIndex: 110 } as React.CSSProperties}
      >
        <SheetHeader className="pb-4 border-b border-border">
          <SheetTitle className="text-lg font-bold leading-none tracking-tight">
            {title}
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-4">
          {children}
        </div>

        {footer && (
          <SheetFooter className="gap-2 sm:gap-0 pt-4 border-t border-border mt-auto">
            {footer}
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}


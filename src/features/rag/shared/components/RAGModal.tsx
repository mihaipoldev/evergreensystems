"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface RAGModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: string;
  className?: string;
}

export function RAGModal({
  open,
  onOpenChange,
  title,
  children,
  footer,
  maxWidth = "md:max-w-[560px]",
  className,
}: RAGModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className={cn(
          "shadow-card max-h-screen md:!h-[95vh] !flex !flex-col",
          maxWidth, 
          className
        )}
      >
        <DialogHeader className="pb-2 md:pb-2 shrink-0">
          <DialogTitle className="text-base md:text-lg font-bold leading-none tracking-tight">
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-y-auto -mx-4 md:-mx-6 px-4 md:px-6 -mb-4 md:-mb-6 pb-4 md:pb-6">
          {children}
        </div>

        {footer && (
          <DialogFooter className="gap-2 md:gap-0 pt-2 shrink-0">
            {footer}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}


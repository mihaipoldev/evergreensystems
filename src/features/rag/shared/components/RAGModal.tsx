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
  maxWidth = "sm:max-w-[560px]",
  className,
}: RAGModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("shadow-card border-0", maxWidth, className)}>
        <DialogHeader className="pb-2">
          <DialogTitle className="text-lg font-bold leading-none tracking-tight">
            {title}
          </DialogTitle>
        </DialogHeader>

        {children}

        {footer && <DialogFooter className="gap-2 sm:gap-0 pt-2">{footer}</DialogFooter>}
      </DialogContent>
    </Dialog>
  );
}


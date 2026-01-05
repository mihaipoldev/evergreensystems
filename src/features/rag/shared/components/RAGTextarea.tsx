"use client";

import { forwardRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export interface RAGTextareaProps
  extends React.ComponentPropsWithoutRef<typeof Textarea> {
  error?: boolean;
}

export const RAGTextarea = forwardRef<
  React.ElementRef<typeof Textarea>,
  RAGTextareaProps
>(({ className, error, ...props }, ref) => {
  return (
    <Textarea
      ref={ref}
      className={cn(
        error
          ? "border-destructive"
          : "shadow-buttons border-none bg-muted/20",
        className
      )}
      {...props}
    />
  );
});

RAGTextarea.displayName = "RAGTextarea";


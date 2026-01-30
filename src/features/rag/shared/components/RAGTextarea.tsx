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
          : "border border-input !shadow-[0px_1px_1px_0px_hsl(var(--foreground)_/_0.08)] dark:!shadow-[0px_1px_1px_0px_hsl(var(--foreground)_/_0.08)] hover:!shadow-[0px_1px_1px_0px_hsl(var(--foreground)_/_0.16)] dark:hover:!shadow-[0px_1px_1px_0px_hsl(var(--foreground)_/_0.12)]",
        className
      )}
      {...props}
    />
  );
});

RAGTextarea.displayName = "RAGTextarea";


"use client";

import { forwardRef } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface RAGInputProps
  extends React.ComponentPropsWithoutRef<typeof Input> {
  error?: boolean;
}

export const RAGInput = forwardRef<
  React.ElementRef<typeof Input>,
  RAGInputProps
>(({ className, error, ...props }, ref) => {
  return (
    <Input
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

RAGInput.displayName = "RAGInput";


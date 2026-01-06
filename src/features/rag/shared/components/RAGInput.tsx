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
          : "shadow-buttons border-none bg-input-background/80",
        className
      )}
      {...props}
    />
  );
});

RAGInput.displayName = "RAGInput";


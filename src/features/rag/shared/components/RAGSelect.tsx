"use client";

import {
  Select as BaseSelect,
  SelectContent as BaseSelectContent,
  SelectItem as BaseSelectItem,
  SelectTrigger as BaseSelectTrigger,
  SelectValue as BaseSelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

// Root Select component
export const RAGSelect = BaseSelect;

// SelectTrigger with consistent styling
export interface RAGSelectTriggerProps
  extends React.ComponentPropsWithoutRef<typeof BaseSelectTrigger> {
  error?: boolean;
}

export const RAGSelectTrigger = forwardRef<
  React.ElementRef<typeof BaseSelectTrigger>,
  RAGSelectTriggerProps
>(({ className, error, ...props }, ref) => {
  return (
    <BaseSelectTrigger
      ref={ref}
      className={cn(
        error
          ? "border-destructive focus:ring-0 focus-visible:ring-0"
          : "shadow-buttons !border-0 bg-muted/20 focus:ring-0 focus-visible:ring-0 focus:outline-none focus:bg-muted/20 focus:!border-0 focus:shadow-buttons hover:bg-muted/20 hover:!border-0 hover:shadow-buttons active:bg-muted/20 active:!border-0 active:shadow-buttons data-[state=open]:bg-muted/20 data-[state=open]:!border-0 data-[state=open]:shadow-buttons",
        className
      )}
      {...props}
    />
  );
});

RAGSelectTrigger.displayName = "RAGSelectTrigger";

// SelectContent with z-index for modals
export interface RAGSelectContentProps
  extends React.ComponentPropsWithoutRef<typeof BaseSelectContent> {}

export const RAGSelectContent = forwardRef<
  React.ElementRef<typeof BaseSelectContent>,
  RAGSelectContentProps
>(({ className, ...props }, ref) => {
  return (
    <BaseSelectContent
      ref={ref}
      className={cn("z-[200]", className)}
      {...props}
    />
  );
});

RAGSelectContent.displayName = "RAGSelectContent";

// SelectItem with consistent hover/focus styling
export interface RAGSelectItemProps
  extends React.ComponentPropsWithoutRef<typeof BaseSelectItem> {}

export const RAGSelectItem = forwardRef<
  React.ElementRef<typeof BaseSelectItem>,
  RAGSelectItemProps
>(({ className, ...props }, ref) => {
  return (
    <BaseSelectItem
      ref={ref}
      className={cn(
        "focus:bg-accent/60 focus:text-foreground cursor-pointer",
        className
      )}
      {...props}
    />
  );
});

RAGSelectItem.displayName = "RAGSelectItem";

// Re-export SelectValue for convenience
export const RAGSelectValue = BaseSelectValue;


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
          ? "border-destructive"
          : "border border-input focus:bg-input-background/50 hover:bg-input-background/50 active:bg-input-background/50 data-[state=open]:bg-input-background/50 !shadow-[0px_1px_1px_0px_hsl(var(--foreground)_/_0.08)] dark:!shadow-[0px_1px_1px_0px_hsl(var(--foreground)_/_0.08)] hover:!shadow-[0px_1px_1px_0px_hsl(var(--foreground)_/_0.16)] dark:hover:!shadow-[0px_1px_1px_0px_hsl(var(--foreground)_/_0.12)] data-[state=open]:!shadow-[0px_1px_1px_0px_hsl(var(--foreground)_/_0.16)] dark:data-[state=open]:!shadow-[0px_1px_1px_0px_hsl(var(--foreground)_/_0.12)]",
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
        "hover:bg-muted/50 focus:bg-muted/50 focus:text-foreground cursor-pointer",
        className
      )}
      {...props}
    />
  );
});

RAGSelectItem.displayName = "RAGSelectItem";

// Re-export SelectValue for convenience
export const RAGSelectValue = BaseSelectValue;


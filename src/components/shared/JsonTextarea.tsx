"use client";

import * as React from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export interface JsonTextareaProps
  extends Omit<React.ComponentPropsWithoutRef<typeof Textarea>, "value" | "onChange"> {
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
}

const JsonTextarea = React.forwardRef<
  HTMLTextAreaElement,
  JsonTextareaProps
>(({ className, error, value, onChange, style, ...props }, ref) => {
  return (
    <Textarea
      ref={ref}
      data-json-textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        "font-mono-code json-textarea-fg resize-none !text-foreground font-semibold",
        "min-h-0",
        error && "border-destructive",
        className
      )}
      style={{
        fontSize: "14px",
        lineHeight: "1.5",
        fontWeight: 400,
        color: "hsl(var(--foreground))",
        WebkitTextFillColor: "hsl(var(--foreground))",
        ...style,
      }}
      {...props}
    />
  );
});
JsonTextarea.displayName = "JsonTextarea";

export { JsonTextarea };

import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

const ShadowInput = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<"input">
>(({ className, ...props }, ref) => {
  return (
    <Input
      ref={ref}
      className={cn("shadow-sm", className)}
      {...props}
    />
  );
});
ShadowInput.displayName = "ShadowInput";

export { ShadowInput };


import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

const InputShadow = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<"input">
>(({ className, ...props }, ref) => {
  return (
    <Input
      ref={ref}
      className={cn(
        "!shadow-[0px_2px_2px_0px_rgba(16,17,26,0.00)] dark:!shadow-[0px_1px_1px_0px_rgba(255,255,255,0.00)] hover:!shadow-[0px_4px_4px_0px_rgba(16,17,26,0.00)] dark:hover:!shadow-[0px_2px_2px_0px_rgba(255,255,255,0.00)]",
        className
      )}
      {...props}
    />
  );
});
InputShadow.displayName = "InputShadow";

export { InputShadow };

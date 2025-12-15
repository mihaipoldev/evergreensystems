import * as React from "react";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";

const TextareaShadow = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <Textarea
      ref={ref}
      className={cn(
        "!shadow-[0px_2px_2px_0px_rgba(16,17,26,0)] dark:!shadow-[0px_1px_1px_0px_rgba(255,255,255,0)] hover:!shadow-[0px_4px_4px_0px_rgba(16,17,26,0)] dark:hover:!shadow-[0px_2px_2px_0px_rgba(255,255,255,0)]",
        className
      )}
      {...props}
    />
  );
});
TextareaShadow.displayName = "TextareaShadow";

export { TextareaShadow };

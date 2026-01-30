import * as React from "react"

import { cn } from "@/lib/utils"

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[60px] w-full rounded-lg border border-input bg-transparent px-3 py-2 text-base placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "!shadow-[0px_1px_1px_0px_hsl(var(--foreground)_/_0.08)] dark:!shadow-[0px_1px_1px_0px_hsl(var(--foreground)_/_0.08)] hover:!shadow-[0px_1px_1px_0px_hsl(var(--foreground)_/_0.16)] dark:hover:!shadow-[0px_1px_1px_0px_hsl(var(--foreground)_/_0.12)]",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }

import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-base transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          "!shadow-[0px_1px_1px_0px_hsl(var(--foreground)_/_0.08)] dark:!shadow-[0px_1px_1px_0px_hsl(var(--foreground)_/_0.08)] hover:!shadow-[0px_1px_1px_0px_hsl(var(--foreground)_/_0.16)] dark:hover:!shadow-[0px_1px_1px_0px_hsl(var(--foreground)_/_0.12)]",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }

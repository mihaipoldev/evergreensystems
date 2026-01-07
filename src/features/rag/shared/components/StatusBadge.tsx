import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusBadgeProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  color: string; // Color class like "blue-600", "green-600", "muted", "destructive", etc.
  children?: React.ReactNode;
}

// Helper function to generate theme-aware color classes
// Light theme: solid background with white text
// Dark theme: semi-transparent background with colored text
function getStatusColorClasses(color: string): string {
  // Map of color names to their theme-aware classes
  const colorMap: Record<string, string> = {
    "muted": "bg-muted text-muted-foreground hover:bg-muted/80 dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted/80",
    "destructive": "bg-red-600 text-white hover:bg-red-600/90 dark:bg-destructive/10 dark:text-destructive dark:hover:bg-destructive/20",
    "red-600": "bg-red-600 text-white hover:bg-red-600/90 dark:bg-destructive/10 dark:text-destructive dark:hover:bg-destructive/20",
    "blue-600": "bg-blue-600 text-white hover:bg-blue-600/90 dark:bg-blue-600/10 dark:text-blue-400 dark:hover:bg-blue-600/20",
    "green-600": "bg-green-600 text-white hover:bg-green-600/90 dark:bg-green-600/10 dark:text-green-400 dark:hover:bg-green-600/20",
    "yellow-600": "bg-yellow-600 text-white hover:bg-yellow-600/90 dark:bg-yellow-600/10 dark:text-yellow-400 dark:hover:bg-yellow-600/20",
    "purple-600": "bg-purple-600 text-white hover:bg-purple-600/90 dark:bg-purple-600/10 dark:text-purple-400 dark:hover:bg-purple-600/20",
    "orange-600": "bg-orange-600 text-white hover:bg-orange-600/90 dark:bg-orange-600/10 dark:text-orange-400 dark:hover:bg-orange-600/20",
  };
  
  return colorMap[color] || colorMap["muted"];
}

export function StatusBadge({ color, className, children, ...props }: StatusBadgeProps) {
  const statusColorClass = getStatusColorClasses(color);
  const displayText = children;

  return (
    <Badge 
      variant="secondary" 
      className={cn("w-fit capitalize", statusColorClass, className)} 
      {...props}
    >
      {displayText}
    </Badge>
  );
}


/**
 * Run Status Color Utility
 * 
 * Centralized utility for determining run status colors and styling
 * based on status values.
 * 
 * Status Mappings:
 * - COMPLETE: Green - Success/completed
 * - FAILED: Red - Error/failure
 * - PROCESSING/COLLECTING/INGESTING/GENERATING: Yellow - In progress/active
 * - QUEUED: Gray - Waiting/pending
 */

export type RunStatusType = "queued" | "collecting" | "ingesting" | "generating" | "complete" | "failed" | "processing";

/**
 * Returns Tailwind classes for text color based on status
 */
export function getRunStatusColorClasses(status: RunStatusType | string): string {
  switch (status) {
    case "complete":
      return "text-green-600 dark:text-green-400";
    case "failed":
      return "text-red-600 dark:text-red-500";
    case "processing":
    case "collecting":
    case "ingesting":
    case "generating":
      return "text-yellow-600 dark:text-yellow-400";
    case "queued":
      return "text-gray-600 dark:text-gray-400";
    default:
      return "text-muted-foreground";
  }
}

/**
 * Returns Tailwind classes for badge styling based on status
 */
export function getRunStatusBadgeClasses(status: RunStatusType | string): string {
  switch (status) {
    case "complete":
      return "bg-green-600/10 text-green-600 dark:text-green-400 border-green-600/20";
    case "failed":
      return "bg-red-600/10 text-red-500 dark:text-red-400 border-red-600/20";
    case "processing":
    case "collecting":
    case "ingesting":
    case "generating":
      return "bg-yellow-600/10 text-yellow-600 dark:text-yellow-400 border-yellow-600/20";
    case "queued":
      return "bg-gray-600/10 text-gray-600 dark:text-gray-400 border-gray-600/20";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

/**
 * Returns gradient and styling classes for cards/components based on status
 */
export function getRunStatusGradientClasses(status: RunStatusType | string) {
  switch (status) {
    case "complete":
      return {
        gradient: "from-green-600/5 via-green-600/2 to-transparent",
        radialGradient: "radial-gradient(ellipse_at_top_right,_hsl(142_71%_45%/0.08),_transparent_60%)",
        iconBg: "bg-green-600/10",
        iconColor: "text-green-600 dark:text-green-400",
        valueColor: "text-green-600 dark:text-green-400",
      };
    case "failed":
      return {
        gradient: "from-red-600/5 via-red-600/2 to-transparent",
        radialGradient: "radial-gradient(ellipse_at_top_right,_hsl(0_72%_51%/0.08),_transparent_60%)",
        iconBg: "bg-red-600/10",
        iconColor: "text-red-500 dark:text-red-400",
        valueColor: "text-red-500 dark:text-red-400",
      };
    case "processing":
    case "collecting":
    case "ingesting":
    case "generating":
      return {
        gradient: "from-yellow-600/5 via-yellow-600/2 to-transparent",
        radialGradient: "radial-gradient(ellipse_at_top_right,_hsl(43_96%_56%/0.08),_transparent_60%)",
        iconBg: "bg-yellow-600/10",
        iconColor: "text-yellow-600 dark:text-yellow-400",
        valueColor: "text-yellow-600 dark:text-yellow-400",
      };
    case "queued":
      return {
        gradient: "from-gray-600/5 via-gray-600/2 to-transparent",
        radialGradient: "radial-gradient(ellipse_at_top_right,_hsl(220_13%_46%/0.08),_transparent_60%)",
        iconBg: "bg-gray-600/10",
        iconColor: "text-gray-600 dark:text-gray-400",
        valueColor: "text-gray-600 dark:text-gray-400",
      };
    default:
      return {
        gradient: "from-muted/5 via-muted/2 to-transparent",
        radialGradient: "radial-gradient(ellipse_at_top_right,_hsl(220_13%_18%/0.08),_transparent_60%)",
        iconBg: "bg-muted",
        iconColor: "text-muted-foreground",
        valueColor: "text-muted-foreground",
      };
  }
}

/**
 * Returns display label for status
 */
export function getRunStatusLabel(status: RunStatusType | string): string {
  switch (status) {
    case "complete":
      return "Complete";
    case "failed":
      return "Failed";
    case "processing":
      return "Processing";
    case "collecting":
      return "Collecting";
    case "ingesting":
      return "Ingesting";
    case "generating":
      return "Generating";
    case "queued":
      return "Queued";
    default:
      return status.charAt(0).toUpperCase() + status.slice(1);
  }
}

/**
 * Returns raw color string (e.g., "green-600", "yellow-600") for backward compatibility
 * This matches the format used by statusColorMap in statusColors.ts
 */
export function getRunStatusColorString(status: RunStatusType | string): string {
  switch (status) {
    case "complete":
      return "green-600";
    case "failed":
      return "red-600";
    case "processing":
    case "collecting":
    case "ingesting":
    case "generating":
      return "yellow-600";
    case "queued":
      return "muted";
    default:
      return "muted";
  }
}


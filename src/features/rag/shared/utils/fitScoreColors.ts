/**
 * Fit Score Color Utility
 * 
 * Centralized utility for determining fit score colors and categories
 * based on score ranges or verdict fallback.
 * 
 * Priority Logic:
 * 1. If fit score exists → use score ranges
 * 2. If only verdict exists → use verdict mapping
 * 3. If both exist → prioritize fit score ranges
 */

export type FitScoreCategory = "ideal" | "pursue" | "test" | "caution" | "avoid";
export type VerdictType = "pursue" | "test" | "caution" | "avoid";

/**
 * Score Range Mappings:
 * - IDEAL (85-100): Emerald - Premium/special
 * - PURSUE (75-84): Green - Clear positive
 * - TEST (65-74): Yellow - Neutral/experimental
 * - CAUTION (50-64): Orange - Warning zone
 * - AVOID (0-49): Red - Stop signal
 */

/**
 * Determines fit score category from score or verdict
 * @param score - Fit score value (0-100) or null
 * @param verdict - Verdict string ("pursue" | "test" | "avoid") or null
 * @returns Category name based on score ranges or verdict fallback
 */
export function getFitScoreCategory(
  score: number | null | undefined,
  verdict?: VerdictType | null
): FitScoreCategory {
  // Priority 1: Use score ranges if score exists
  if (score !== null && score !== undefined) {
    if (score >= 85) return "ideal";
    if (score >= 75) return "pursue";
    if (score >= 65) return "test";
    if (score >= 50) return "caution";
    return "avoid";
  }

  // Priority 2: Fallback to verdict mapping if no score
  if (verdict === "pursue") return "pursue";
  if (verdict === "test") return "test";
  if (verdict === "caution") return "caution";
  if (verdict === "avoid") return "avoid";

  // Default fallback
  return "avoid";
}

/**
 * Returns Tailwind classes for text color based on category
 */
export function getFitScoreColorClasses(category: FitScoreCategory): string {
  switch (category) {
    case "ideal":
      return "text-emerald-500 dark:text-emerald-400";
    case "pursue":
      return "text-green-600 dark:text-green-400";
    case "test":
      return "text-yellow-600 dark:text-yellow-400";
    case "caution":
      return "text-orange-600 dark:text-orange-400";
    case "avoid":
      // Use a slightly deeper red for better contrast
      return "text-red-600 dark:text-red-500";
  }
}

/**
 * Returns Tailwind classes for badge styling based on category
 */
export function getFitScoreBadgeClasses(category: FitScoreCategory): string {
  switch (category) {
    case "ideal":
      return "bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border-emerald-500/20";
    case "pursue":
      return "bg-green-600/10 text-green-600 dark:text-green-400 border-green-600/20";
    case "test":
      return "bg-yellow-600/10 text-yellow-600 dark:text-yellow-400 border-yellow-600/20";
    case "caution":
      return "bg-orange-600/10 text-orange-600 dark:text-orange-400 border-orange-600/20";
    case "avoid":
      return "bg-red-600/10 text-red-500 dark:text-red-400 border-red-600/20";
  }
}

/**
 * Returns gradient and styling classes for StatCard based on category
 */
export function getFitScoreGradientClasses(category: FitScoreCategory) {
  switch (category) {
    case "ideal":
      return {
        gradient: "from-emerald-500/5 via-emerald-500/2 to-transparent",
        radialGradient: "radial-gradient(ellipse_at_top_right,_hsl(160_84%_39%/0.08),_transparent_60%)",
        iconBg: "bg-emerald-500/10",
        iconColor: "text-emerald-500 dark:text-emerald-400",
        valueColor: "text-emerald-500 dark:text-emerald-400",
      };
    case "pursue":
      return {
        gradient: "from-green-600/5 via-green-600/2 to-transparent",
        radialGradient: "radial-gradient(ellipse_at_top_right,_hsl(142_71%_45%/0.08),_transparent_60%)",
        iconBg: "bg-green-600/10",
        iconColor: "text-green-600 dark:text-green-400",
        valueColor: "text-green-600 dark:text-green-400",
      };
    case "test":
      return {
        gradient: "from-yellow-600/5 via-yellow-600/2 to-transparent",
        radialGradient: "radial-gradient(ellipse_at_top_right,_hsl(43_96%_56%/0.08),_transparent_60%)",
        iconBg: "bg-yellow-600/10",
        iconColor: "text-yellow-600 dark:text-yellow-400",
        valueColor: "text-yellow-600 dark:text-yellow-400",
      };
    case "caution":
      return {
        gradient: "from-orange-600/5 via-orange-600/2 to-transparent",
        radialGradient: "radial-gradient(ellipse_at_top_right,_hsl(25_95%_53%/0.08),_transparent_60%)",
        iconBg: "bg-orange-600/10",
        iconColor: "text-orange-600 dark:text-orange-400",
        valueColor: "text-orange-600 dark:text-orange-400",
      };
    case "avoid":
      return {
        gradient: "from-red-600/5 via-red-600/2 to-transparent",
        radialGradient: "radial-gradient(ellipse_at_top_right,_hsl(0_72%_51%/0.08),_transparent_60%)",
        iconBg: "bg-red-600/10",
        iconColor: "text-red-500 dark:text-red-400",
        valueColor: "text-red-500 dark:text-red-400",
      };
  }
}

/**
 * Returns display label for category
 */
export function getFitScoreLabel(category: FitScoreCategory): string {
  switch (category) {
    case "ideal":
      return "Ideal";
    case "pursue":
      return "Pursue";
    case "test":
      return "Test";
    case "caution":
      return "Caution";
    case "avoid":
      return "Avoid";
  }
}


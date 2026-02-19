"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { cn } from "@/lib/utils";

import {
  getFitScoreCategory,
  getFitScoreGradientClasses,
} from "../utils/fitScoreColors";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: IconDefinition;
  index?: number;
  verdict?: "pursue" | "test" | "caution" | "avoid" | null;
  fit_score?: number | null;
}

export function StatCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon,
  index = 0,
  verdict,
  fit_score,
}: StatCardProps) {
  const changeColors = {
    positive: "text-green-600 dark:text-green-400",
    negative: "text-destructive",
    neutral: "text-muted-foreground",
  };

  // Determine category based on fit_score (priority) or verdict (fallback)
  // If neither exists, use default primary colors
  const hasFitScoreOrVerdict = (fit_score !== null && fit_score !== undefined) || (verdict !== null && verdict !== undefined);
  let colors;
  
  if (hasFitScoreOrVerdict) {
    const category = getFitScoreCategory(fit_score ?? null, verdict ?? null);
    colors = getFitScoreGradientClasses(category);
  } else {
    // Default primary colors when no fit_score or verdict
    colors = {
      gradient: "from-primary/5 via-primary/2 to-transparent",
      radialGradient: "radial-gradient(ellipse_at_top_right,_hsl(var(--primary)/0.08),_transparent_60%)",
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
      valueColor: "text-foreground",
    };
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.4,
        delay: index * 0.05,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      <Card className="p-3 md:p-5 relative overflow-hidden border-0 shadow-card-light transition-all duration-300 hover:shadow-card hover:scale-[1.02] cursor-default">
        {/* Gradient overlays */}
        <div className={cn("absolute inset-0 bg-gradient-to-br pointer-events-none", colors.gradient)} />
        <div 
          className="absolute inset-0 pointer-events-none" 
          style={{ background: colors.radialGradient }}
        />
        
        <div className="flex items-start justify-between relative z-10">
          <div className="space-y-1 md:space-y-2 min-w-0 flex-1">
            <p className="text-xs md:text-sm text-muted-foreground font-medium truncate">{title}</p>
            {typeof value === "string" && value.includes("/100") ? (
              <p className={cn("text-lg md:text-2xl font-semibold", colors.valueColor)}>
                {value.split("/100")[0]}
                <span className="text-xs text-muted-foreground ml-1">/100</span>
              </p>
            ) : (
              <p className={cn("text-lg md:text-2xl font-semibold truncate", colors.valueColor)}>{value}</p>
            )}
            {change && (
              <p className={cn("text-xs md:text-sm font-medium", changeColors[changeType])}>
                {change}
              </p>
            )}
          </div>
          <div className={cn("h-8 w-8 md:h-10 md:w-10 rounded-lg flex items-center justify-center flex-shrink-0 ml-2", colors.iconBg)}>
            <FontAwesomeIcon
              icon={icon}
              className={cn("h-4 w-4 md:h-5 md:w-5", colors.iconColor)}
            />
          </div>
        </div>
      </Card>
    </motion.div>
  );
}


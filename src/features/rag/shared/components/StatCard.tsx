"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: IconDefinition;
  index?: number;
  verdict?: "pursue" | "test" | "avoid" | null;
}

// Helper function to get verdict colors
const getVerdictColorClasses = (verdict?: "pursue" | "test" | "avoid" | null) => {
  if (verdict === "pursue") {
    return {
      gradient: "from-green-600/5 via-green-600/2 to-transparent",
      radialGradient: "radial-gradient(ellipse_at_top_right,_hsl(142_71%_45%/0.08),_transparent_60%)",
      iconBg: "bg-green-600/10",
      iconColor: "text-green-600 dark:text-green-400",
      valueColor: "text-green-600 dark:text-green-400",
    };
  }
  if (verdict === "test") {
    return {
      gradient: "from-yellow-600/5 via-yellow-600/2 to-transparent",
      radialGradient: "radial-gradient(ellipse_at_top_right,_hsl(43_96%_56%/0.08),_transparent_60%)",
      iconBg: "bg-yellow-600/10",
      iconColor: "text-yellow-600 dark:text-yellow-400",
      valueColor: "text-yellow-600 dark:text-yellow-400",
    };
  }
  if (verdict === "avoid") {
    return {
      gradient: "from-red-600/5 via-red-600/2 to-transparent",
      radialGradient: "radial-gradient(ellipse_at_top_right,_hsl(0_72%_51%/0.08),_transparent_60%)",
      iconBg: "bg-red-600/10",
      iconColor: "text-red-600 dark:text-red-400",
      valueColor: "text-red-600 dark:text-red-400",
    };
  }
  // Default primary colors
  return {
    gradient: "from-primary/5 via-primary/2 to-transparent",
    radialGradient: "radial-gradient(ellipse_at_top_right,_hsl(var(--primary)/0.08),_transparent_60%)",
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
    valueColor: "text-foreground",
  };
};

export function StatCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon,
  index = 0,
  verdict,
}: StatCardProps) {
  const changeColors = {
    positive: "text-green-600 dark:text-green-400",
    negative: "text-destructive",
    neutral: "text-muted-foreground",
  };

  const colors = getVerdictColorClasses(verdict);

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
      <Card className="p-5 relative overflow-hidden border-0 shadow-card-light transition-all duration-300 hover:shadow-card hover:scale-[1.02] cursor-default">
        {/* Gradient overlays */}
        <div className={cn("absolute inset-0 bg-gradient-to-br pointer-events-none", colors.gradient)} />
        <div 
          className="absolute inset-0 pointer-events-none" 
          style={{ background: colors.radialGradient }}
        />
        
        <div className="flex items-start justify-between relative z-10">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground font-medium">{title}</p>
            <p className={cn("text-2xl font-semibold", colors.valueColor)}>{value}</p>
            {change && (
              <p className={cn("text-sm font-medium", changeColors[changeType])}>
                {change}
              </p>
            )}
          </div>
          <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center", colors.iconBg)}>
            <FontAwesomeIcon
              icon={icon}
              className={cn("h-5 w-5", colors.iconColor)}
            />
          </div>
        </div>
      </Card>
    </motion.div>
  );
}


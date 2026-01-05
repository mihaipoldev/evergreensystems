"use client";

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
}

export function StatCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon,
}: StatCardProps) {
  const changeColors = {
    positive: "text-green-600 dark:text-green-400",
    negative: "text-destructive",
    neutral: "text-muted-foreground",
  };

  return (
    <Card className="p-5 relative overflow-hidden border-0">
      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-primary/2 to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_hsl(var(--primary)/0.08),_transparent_60%)] pointer-events-none" />
      
      <div className="flex items-start justify-between relative z-10">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <p className="text-2xl font-semibold text-foreground">{value}</p>
          {change && (
            <p className={cn("text-sm font-medium", changeColors[changeType])}>
              {change}
            </p>
          )}
        </div>
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <FontAwesomeIcon
            icon={icon}
            className="h-5 w-5 text-primary"
          />
        </div>
      </div>
    </Card>
  );
}


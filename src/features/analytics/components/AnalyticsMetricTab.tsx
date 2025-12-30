"use client";

import { TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

type AnalyticsMetricTabProps = {
  value: string;
  label: string;
  metric: number;
  subtitle?: string;
  className?: string;
};

export function AnalyticsMetricTab({
  value,
  label,
  metric,
  subtitle,
  className,
}: AnalyticsMetricTabProps) {
  return (
    <TabsTrigger
      value={value}
      className={cn(
        "flex flex-col items-start justify-center px-4 py-2 md:px-6 md:py-4 h-auto rounded-none dark:bg-background/90 bg-muted/70 data-[state=active]:bg-card dark:data-[state=active]:bg-card data-[state=active]:shadow-none",
        className
      )}
    >
      <div className="text-[10px] md:text-sm font-medium text-muted-foreground mb-1 leading-tight">{label}</div>
      <div className="flex items-baseline gap-2">
        <span className="text-lg md:text-2xl font-bold tabular-nums">{metric.toLocaleString()}</span>
        {subtitle && (
          <span className="text-xs text-muted-foreground">{subtitle}</span>
        )}
      </div>
    </TabsTrigger>
  );
}


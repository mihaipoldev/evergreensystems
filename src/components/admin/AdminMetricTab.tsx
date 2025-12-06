"use client";

import { TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

type AdminMetricTabProps = {
  value: string;
  label: string;
  metric: number;
  subtitle?: string;
  className?: string;
};

export function AdminMetricTab({
  value,
  label,
  metric,
  subtitle,
  className,
}: AdminMetricTabProps) {
  return (
    <TabsTrigger
      value={value}
      className={cn(
        "flex flex-col items-start justify-center p-2 md:p-4 h-auto rounded-none data-[state=active]:bg-transparent data-[state=active]:shadow-none",
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

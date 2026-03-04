import { LucideIcon } from "lucide-react";
import { BaseTile } from "./BaseTile";

interface StatTileProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    positive: boolean;
  };
  onClick?: () => void;
}

export function StatTile({ label, value, icon: Icon, trend, onClick }: StatTileProps) {
  return (
    <BaseTile onClick={onClick} className="min-h-[100px]">
      <div className="flex items-start justify-between">
        <div className="p-2 rounded-lg bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        {trend && (
          <span
            className={`text-xs font-medium ${
              trend.positive ? "text-status-active" : "text-destructive"
            }`}
          >
            {trend.positive ? "+" : ""}{trend.value}%
          </span>
        )}
      </div>
      <div className="mt-3">
        <p className="text-2xl font-semibold tracking-tight">{value}</p>
        <p className="text-sm text-muted-foreground mt-0.5">{label}</p>
      </div>
    </BaseTile>
  );
}

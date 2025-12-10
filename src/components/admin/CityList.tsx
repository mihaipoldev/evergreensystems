"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type CityData = {
  city: string;
  count: number;
};

type CityListProps = {
  cities: CityData[];
  className?: string;
};

export function CityList({ cities, className }: CityListProps) {
  if (cities.length === 0) {
    return (
      <div className={cn("text-center text-muted-foreground py-8", className)}>
        No city data yet.
      </div>
    );
  }

  const maxCount = cities[0]?.count || 1;

  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-3 gap-4", className)}>
      {cities.map((item) => {
        const percentage = (item.count / maxCount) * 100;

        return (
          <div
            key={item.city}
            className="flex items-center gap-3 p-3 rounded-lg bg-card/50"
          >
            {/* City icon placeholder */}
            <div className="flex-shrink-0 w-8 h-8 rounded overflow-hidden bg-muted flex items-center justify-center text-xs font-bold">
              <span className="text-lg" role="img" aria-label={item.city}>
                🏙️
              </span>
            </div>

            {/* City name and value */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-sm font-medium truncate">{item.city}</span>
                <span className="text-sm font-semibold tabular-nums whitespace-nowrap">
                  {item.count.toLocaleString()}
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

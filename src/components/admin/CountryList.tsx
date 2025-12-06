"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type CountryData = {
  country: string;
  count: number;
};

type CountryListProps = {
  countries: CountryData[];
  className?: string;
};

// Get country code from country name (ISO 3166-1 alpha-2)
// This is a simplified mapping - you might want to use a library like country-list
const getCountryCode = (countryName: string): string => {
  const countryMap: Record<string, string> = {
    "United States": "US",
    "United Kingdom": "GB",
    "Canada": "CA",
    "Germany": "DE",
    "France": "FR",
    "Italy": "IT",
    "Spain": "ES",
    "Netherlands": "NL",
    "Belgium": "BE",
    "Switzerland": "CH",
    "Austria": "AT",
    "Sweden": "SE",
    "Norway": "NO",
    "Denmark": "DK",
    "Finland": "FI",
    "Poland": "PL",
    "Czech Republic": "CZ",
    "Romania": "RO",
    "Hungary": "HU",
    "Greece": "GR",
    "Portugal": "PT",
    "Ireland": "IE",
    "Australia": "AU",
    "New Zealand": "NZ",
    "Japan": "JP",
    "South Korea": "KR",
    "China": "CN",
    "India": "IN",
    "Brazil": "BR",
    "Mexico": "MX",
    "Argentina": "AR",
    "Chile": "CL",
    "South Africa": "ZA",
    "Israel": "IL",
    "Turkey": "TR",
    "Russia": "RU",
    "Ukraine": "UA",
    "Singapore": "SG",
    "Malaysia": "MY",
    "Thailand": "TH",
    "Indonesia": "ID",
    "Philippines": "PH",
    "Vietnam": "VN",
  };

  return countryMap[countryName] || countryName.substring(0, 2).toUpperCase();
};

export function CountryList({ countries, className }: CountryListProps) {
  if (countries.length === 0) {
    return (
      <div className={cn("text-center text-muted-foreground py-8", className)}>
        No country data yet.
      </div>
    );
  }

  const maxCount = countries[0]?.count || 1;

  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-3 gap-4", className)}>
      {countries.map((item) => {
        const countryCode = getCountryCode(item.country);
        const percentage = (item.count / maxCount) * 100;

        return (
          <div
            key={item.country}
            className="flex items-center gap-3 p-3 rounded-lg border bg-card/50"
          >
            {/* Flag */}
            <div className="flex-shrink-0 w-8 h-8 rounded overflow-hidden bg-muted flex items-center justify-center text-xs font-bold">
              <span className="text-lg" role="img" aria-label={item.country}>
                {countryCode
                  .split("")
                  .map((char) => String.fromCodePoint(127397 + char.charCodeAt(0)))
                  .join("")}
              </span>
            </div>

            {/* Country name and value */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-sm font-medium truncate">{item.country}</span>
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

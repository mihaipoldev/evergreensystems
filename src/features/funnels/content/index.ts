import { outboundSystemContent } from "./outbound-system";
import { commercialCleaningContent } from "./commercial-cleaning";
import { commercialHvacContent } from "./commercial-hvac";
import { recruitingAgenciesContent } from "./recruiting-agencies";
import type { FunnelContent } from "../types";

const funnelContentMap: Record<string, FunnelContent> = {
  "outbound-system": outboundSystemContent,
  "commercial-cleaning": commercialCleaningContent,
  "commercial-hvac": commercialHvacContent,
  "recruiting-agencies": recruitingAgenciesContent,
};

export function getFunnelContent(slug: string): FunnelContent | null {
  return funnelContentMap[slug] ?? null;
}

export function getAllFunnelSlugs(): string[] {
  return Object.keys(funnelContentMap);
}

export function getAllFunnelEntries(): { slug: string; displayName: string; routePath: string }[] {
  return Object.values(funnelContentMap).map((c) => ({
    slug: c.slug,
    displayName: c.displayName,
    routePath: c.routePath ?? c.slug,
  }));
}

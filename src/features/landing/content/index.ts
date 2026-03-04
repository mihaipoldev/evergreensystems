import { homeContent } from "./home";
import type { LandingPageContent } from "../types";

const landingContentMap: Record<string, LandingPageContent> = {
  home: homeContent,
};

export function getLandingContent(
  slug: string
): LandingPageContent | null {
  return landingContentMap[slug] ?? null;
}

export function getAllLandingSlugs(): string[] {
  return Object.keys(landingContentMap);
}

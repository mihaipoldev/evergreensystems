import { SECTIONS_MAP } from "../registry";
import type { ReportSection } from "../types/meta";

/**
 * Resolves the full list of table-of-contents sections for a report.
 *
 * Starts with the base sections from the automation registry, then
 * dynamically appends research-links and sources-used if present.
 */
export function getSectionsForReport(
  automationName: string | undefined,
  reportData: { meta: { sources_used?: string[] }; data: unknown }
): ReportSection[] {
  const base = automationName ? SECTIONS_MAP[automationName] : undefined;
  const sections = base ? [...base] : [];

  const dataAny = reportData.data as Record<string, unknown>;
  if (dataAny?.research_links) {
    const nextNum = String(sections.length + 1).padStart(2, "0");
    sections.push({ id: "research-links", number: nextNum, title: "Research Links" });
  }
  if (reportData.meta.sources_used && reportData.meta.sources_used.length > 0) {
    const nextNum = String(sections.length + 1).padStart(2, "0");
    sections.push({ id: "sources-used", number: nextNum, title: "Sources Used" });
  }

  return sections;
}

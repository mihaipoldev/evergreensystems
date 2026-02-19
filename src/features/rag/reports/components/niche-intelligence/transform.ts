import type { ReportData } from "../../types";
import { buildReportMeta } from "../../utils/buildReportMeta";

/**
 * Transform raw output_json for niche-intelligence / descriptive-intelligence reports.
 * Expects the new standardized { meta, data } structure with automation_name.
 */
export function transformNicheIntelligence(payload: {
  meta: Record<string, any>;
  data: Record<string, any>;
}): ReportData {
  const meta = payload.meta || {};
  const data = payload.data || {};

  // Strip fields that should not appear as sections (they live in meta.analysis_summary)
  const cleanedData = { ...data };
  delete cleanedData.executive_summary;
  delete cleanedData.quick_reference;

  return {
    meta: buildReportMeta(meta),
    data: cleanedData,
  };
}

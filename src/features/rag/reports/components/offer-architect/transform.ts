import type { ReportData } from "../../types";
import { buildReportMeta } from "../../utils/buildReportMeta";

/**
 * Transform raw output_json for offer-architect reports.
 * Expects the standardized { meta, data } structure with automation_name.
 */
export function transformOfferArchitect(payload: {
  meta: Record<string, any>;
  data: Record<string, any>;
}): ReportData {
  const meta = payload.meta || {};
  const data = payload.data || {};

  return {
    meta: buildReportMeta(meta),
    data,
  };
}

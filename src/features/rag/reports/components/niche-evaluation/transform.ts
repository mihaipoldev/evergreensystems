import type { ReportData } from "../../types";
import { buildReportMeta } from "../../utils/buildReportMeta";

/**
 * Transform raw output_json for niche-fit-evaluation reports.
 * Expects the new standardized { meta, data } structure with automation_name.
 * data contains: decision_card, meta_synthesis, individual_evaluations, etc.
 */
export function transformNicheEvaluation(payload: {
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

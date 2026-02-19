import type { ReportData } from "../../types";
import { buildReportMeta } from "../../utils/buildReportMeta";

/**
 * Transform raw output_json for outbound-strategy / lead-gen-targeting / offer-architect reports.
 * Expects the new standardized { meta, data } structure with automation_name.
 * data contains: target_profile, targeting_strategy, title_packs, messaging, etc.
 */
export function transformOutboundStrategy(payload: {
  meta: Record<string, any>;
  data: Record<string, any>;
}): ReportData {
  const meta = payload.meta || {};
  const data = payload.data || {};

  const rawConfidence = typeof meta.confidence === "number" ? meta.confidence : 0;
  const confidence = rawConfidence > 1 ? rawConfidence / 100 : rawConfidence;

  return {
    meta: buildReportMeta(meta, { confidence }),
    data,
  };
}

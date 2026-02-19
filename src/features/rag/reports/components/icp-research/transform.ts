import type { ReportData } from "../../types";
import { buildReportMeta } from "../../utils/buildReportMeta";

/**
 * Transform raw output_json for icp-research / customer-intelligence reports.
 * Expects the new standardized { meta, data } structure with automation_name.
 *
 * Handles two data shapes:
 *   1. data.buyer_icp already nested (preferred new format)
 *   2. data.snapshot / data.customer_segments flat (older assembly format → reshapes into buyer_icp)
 */
export function transformICPResearch(payload: {
  meta: Record<string, any>;
  data: Record<string, any>;
}): ReportData {
  const meta = payload.meta || {};
  const d = payload.data || {};

  // If data already has buyer_icp, use it directly; otherwise reshape flat fields
  let data: Record<string, unknown>;
  if (d.buyer_icp != null) {
    data = d;
  } else if (d.snapshot != null) {
    const customerSegments = d.customer_segments as Record<string, unknown> | undefined;
    data = {
      buyer_icp: {
        snapshot: d.snapshot,
        triggers: d.buying_triggers,
        buying_committee: d.buying_committee,
        purchase_journey: d.purchase_journey,
        segments: customerSegments
          ? {
              primary: customerSegments.primary_segments ?? [],
              secondary: customerSegments.secondary_segments ?? [],
              avoid: customerSegments.avoid_segments ?? [],
              assignment_logic: customerSegments.assignment_logic ?? { method: "", rules: [] },
            }
          : undefined,
        competitive_context: d.competitive_alternatives,
      },
      market_sizing: d.market_sizing,
      typical_customer_types: d.typical_customer_types,
    };
  } else {
    data = d;
  }

  const rawConfidence = typeof meta.confidence === "number" ? meta.confidence : 0;
  const confidence = rawConfidence > 1 ? rawConfidence / 100 : rawConfidence;

  return {
    meta: buildReportMeta(meta, { confidence }),
    data,
  };
}

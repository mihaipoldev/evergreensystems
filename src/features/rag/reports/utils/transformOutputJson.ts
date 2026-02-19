import type { ReportData } from "../types";
import { buildReportMeta } from "./buildReportMeta";
import { TRANSFORM_MAP } from "../registry";

/**
 * Transforms raw output_json from rag_run_outputs into a normalized ReportData structure.
 *
 * Routes to the appropriate per-automation transform based on meta.automation_name,
 * using the centralized TRANSFORM_MAP from the automation registry.
 *
 * @param outputJson - Raw JSON from rag_run_outputs.output_json
 * @returns Normalized ReportData structure
 */
export function transformOutputJson(outputJson: Record<string, any>): ReportData {
  // Handle array wrapper (some outputs are wrapped as [{ meta, data }])
  const payload = Array.isArray(outputJson) && outputJson.length > 0
    ? outputJson[0]
    : outputJson;

  const meta = payload?.meta;

  if (!meta?.automation_name) {
    // Fallback: try to detect from data shape for any edge cases
    const detected = detectAutomationName(payload);
    if (detected) {
      const transform = TRANSFORM_MAP[detected];
      if (transform) {
        return transform({
          meta: { ...meta, automation_name: detected },
          data: payload?.data || {},
        });
      }
    }
    console.warn(
      "[transformOutputJson] Missing meta.automation_name, returning raw payload with defaults"
    );
    return buildFallback(payload);
  }

  const transform = TRANSFORM_MAP[meta.automation_name];
  if (!transform) {
    console.warn(
      `[transformOutputJson] Unknown automation: "${meta.automation_name}", returning raw payload`
    );
    return buildFallback(payload);
  }

  return transform({ meta, data: payload.data || {} });
}

/**
 * Best-effort detection of automation type from data shape.
 * Used only as a fallback when automation_name is missing.
 */
function detectAutomationName(
  payload: Record<string, any> | null
): string | null {
  const data = payload?.data as Record<string, unknown> | undefined;
  const meta = payload?.meta as Record<string, unknown> | undefined;
  if (!data && !meta) return null;

  // Niche evaluation
  if (data?.decision_card ?? data?.meta_synthesis ?? data?.individual_evaluations) {
    return "niche-fit-evaluation";
  }
  // ICP research
  if (data?.buyer_icp || data?.snapshot) {
    return "icp-research";
  }
  // Outbound strategy
  if (
    data?.title_packs != null ||
    data?.target_profile != null ||
    meta?.report_type === "full_targeting_positioning_sales_playbook"
  ) {
    return "outbound-strategy";
  }
  // Niche intelligence
  if (data?.basic_profile != null) {
    return "niche-intelligence";
  }
  return null;
}

/**
 * Fallback that wraps raw payload into a ReportData shape with sensible defaults.
 */
function buildFallback(payload: Record<string, any> | null): ReportData {
  const meta = payload?.meta || {};
  const data = payload?.data || {};
  return { meta: buildReportMeta(meta), data };
}

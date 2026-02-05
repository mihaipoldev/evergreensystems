/**
 * Format duration in seconds as "Xm Ys" or "Xs"
 */
function formatDurationSeconds(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

/**
 * Compute duration in seconds from start and end timestamps
 */
function computeDurationSeconds(
  start: string | undefined,
  end: string | undefined
): number | null {
  if (!start) return null;
  const startTime = new Date(start).getTime();
  const endTime = end ? new Date(end).getTime() : Date.now();
  const diffMs = endTime - startTime;
  if (diffMs < 0) return null;
  return Math.floor(diffMs / 1000);
}

/**
 * Extract usage metrics (duration, cost) from a run.
 * Duration: from output_json.meta.usage_metrics.duration_seconds, or computed from metadata/created_at/updated_at.
 * Cost: from output_json.meta.usage_metrics.
 */
export function extractUsageFromRun(run: {
  output_json?: unknown;
  metadata?: Record<string, unknown>;
  status?: string;
  created_at?: string;
  updated_at?: string;
}): {
  duration: string | null;
  durationSeconds: number | null;
  cost: number | null;
} {
  const outputJson = run.output_json;
  const meta = outputJson && typeof outputJson === "object"
    ? ((outputJson as Record<string, unknown>)?.meta as Record<string, unknown> | undefined)
    : undefined;
  const usageMetrics = meta?.usage_metrics as {
    duration_seconds?: number;
    costs?: { total?: number };
    per_evaluation?: { total_cost?: number };
  } | undefined;

  let durationSeconds: number | null = null;
  if (usageMetrics?.duration_seconds != null && usageMetrics.duration_seconds >= 0) {
    durationSeconds = usageMetrics.duration_seconds;
  } else if (run.status === "complete" && run.created_at && run.updated_at) {
    const metadata = run.metadata || {};
    const startedAt = (metadata.started_at as string) || run.created_at;
    const completedAt = (metadata.completed_at as string) || run.updated_at;
    durationSeconds = computeDurationSeconds(startedAt, completedAt);
  }

  let cost: number | null = null;
  if (usageMetrics?.costs?.total != null) {
    cost = usageMetrics.costs.total;
  } else if (usageMetrics?.per_evaluation?.total_cost != null) {
    cost = usageMetrics.per_evaluation.total_cost;
  }

  return {
    duration: durationSeconds != null ? formatDurationSeconds(durationSeconds) : null,
    durationSeconds,
    cost,
  };
}

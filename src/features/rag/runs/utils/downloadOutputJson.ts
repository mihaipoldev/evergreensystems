import { createClient } from "@/lib/supabase/client";

/**
 * Fetches output JSON for a report and triggers a file download.
 * @param reportId - Report ID from rag_reports
 * @param filename - Optional filename (e.g. "run-abc123.json"). Defaults to "output-{reportId}.json"
 */
export async function downloadOutputJson(
  reportId: string,
  filename?: string
): Promise<void> {
  const supabase = createClient();
  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData?.session?.access_token;

  const response = await fetch(`/api/intel/reports/${reportId}`, {
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || "Failed to load report");
  }

  const data = await response.json();
  const outputJson = data?.output_json;
  if (outputJson == null) {
    throw new Error("No output JSON available");
  }

  const jsonString =
    typeof outputJson === "string"
      ? outputJson
      : JSON.stringify(outputJson, null, 2);

  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename ?? `output-${reportId}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

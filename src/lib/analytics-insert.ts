import { createServiceRoleClient } from "@/lib/supabase/server";
import { headers } from "next/headers";
import { parseDevice } from "@/lib/ua-device";

interface InsertAnalyticsEventParams {
  event_type: string;
  entity_type: string;
  entity_id: string;
  session_id?: string | null;
  user_agent?: string | null;
  referrer?: string | null;
  metadata?: Record<string, unknown> | null;
}

export async function insertAnalyticsEvent(params: InsertAnalyticsEventParams) {
  const { event_type, entity_type, entity_id, session_id, user_agent, referrer, metadata } = params;

  const headersList = await headers();

  const country = headersList.get("x-vercel-ip-country") || null;
  // Subdivision (US state etc.) from Vercel's edge geo headers.
  const region = headersList.get("x-vercel-ip-country-region") || null;
  const city = headersList.get("x-vercel-ip-city") || null;
  const finalUserAgent = user_agent || headersList.get("user-agent") || null;
  const finalReferrer = referrer || headersList.get("referer") || null;

  // Parse UA into device buckets once, at write time, so the dashboard never
  // has to interpret raw user_agent strings.
  const device = parseDevice(finalUserAgent);
  const finalMetadata = device
    ? { ...(metadata || {}), device }
    : metadata || null;

  const supabase = createServiceRoleClient();
  const db = supabase as any;

  const { data: workspace } = await db
    .from("workspaces")
    .select("id")
    .eq("slug", "evergreen")
    .single();

  const { data, error } = await db
    .from("analytics_events")
    .insert({
      event_type,
      entity_type,
      entity_id,
      session_id: session_id || null,
      country,
      region,
      city,
      user_agent: finalUserAgent,
      referrer: finalReferrer,
      metadata: finalMetadata,
      workspace_id: workspace?.id,
    })
    .select()
    .single();

  return { data, error };
}

import { createServiceRoleClient } from "@/lib/supabase/server";
import { headers } from "next/headers";

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
  const city = headersList.get("x-vercel-ip-city") || null;
  const finalUserAgent = user_agent || headersList.get("user-agent") || null;
  const finalReferrer = referrer || headersList.get("referer") || null;

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
      city,
      user_agent: finalUserAgent,
      referrer: finalReferrer,
      metadata: metadata || null,
      workspace_id: workspace?.id,
    })
    .select()
    .single();

  return { data, error };
}

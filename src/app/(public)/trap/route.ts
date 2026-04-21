import { NextResponse } from "next/server";
import { insertAnalyticsEvent } from "@/lib/analytics-insert";

export async function GET() {
  await insertAnalyticsEvent({
    event_type: "link_click",
    entity_type: "site_section",
    entity_id: "honeypot",
  });
  return new NextResponse(null, { status: 204 });
}

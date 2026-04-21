import { createClient, createServiceRoleClient, fetchAllRows } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { isbot } from "isbot";
import { insertAnalyticsEvent } from "@/lib/analytics-insert";

export async function GET(request: Request) {
  try {
    const authClient = await createClient();
    const { data: { user } } = await authClient.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createServiceRoleClient();
    const { searchParams } = new URL(request.url);
    const eventType = searchParams.get("event_type");
    const entityType = searchParams.get("entity_type");
    const entityId = searchParams.get("entity_id");
    const sessionId = searchParams.get("session_id");
    const startDate = searchParams.get("start_date");
    const endDate = searchParams.get("end_date");

    let query = supabase
      .from("analytics_events")
      .select("*");

    if (eventType) {
      query = query.eq("event_type", eventType);
    }

    if (entityType) {
      query = query.eq("entity_type", entityType);
    }

    if (entityId) {
      query = query.eq("entity_id", entityId);
    }

    if (sessionId) {
      query = query.eq("session_id", sessionId);
    }

    if (startDate) {
      query = query.gte("created_at", startDate);
    }

    if (endDate) {
      query = query.lte("created_at", endDate);
    }

    const { data, error } = await fetchAllRows<any>(query, "created_at", false);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Skip tracking in development/localhost mode
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    // Also check hostname from headers as a fallback
    const headersList = await headers();
    const host = headersList.get('host') || '';
    const isLocalhost = 
      host.includes('localhost') || 
      host.includes('127.0.0.1') || 
      host.includes('0.0.0.0') ||
      host.startsWith('192.168.') ||
      host.startsWith('10.0.');

    if (isDevelopment || isLocalhost) {
      return NextResponse.json(
        { message: "Analytics tracking skipped (development mode)" },
        { status: 200 }
      );
    }

    const ua = headersList.get("user-agent") || "";
    if (isbot(ua)) {
      return NextResponse.json({ skipped: "bot" }, { status: 200 });
    }

    // Public endpoint - no authentication required for tracking
    const body = await request.json();
    
    const { 
      event_type, 
      entity_type, 
      entity_id, 
      session_id, 
      user_agent, 
      referrer, 
      metadata 
    } = body;

    // Validate required fields
    if (!event_type) {
      return NextResponse.json(
        { error: "event_type is required" },
        { status: 400 }
      );
    }

    if (!entity_type) {
      return NextResponse.json(
        { error: "entity_type is required" },
        { status: 400 }
      );
    }

    if (!entity_id) {
      return NextResponse.json(
        { error: "entity_id is required" },
        { status: 400 }
      );
    }

    const { data, error } = await insertAnalyticsEvent({
      event_type,
      entity_type,
      entity_id,
      session_id,
      user_agent,
      referrer,
      metadata,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

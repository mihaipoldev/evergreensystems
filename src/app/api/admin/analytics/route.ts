import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { Database } from "@/lib/supabase/types";
import { headers } from "next/headers";

type AnalyticsEventInsert = Database["public"]["Tables"]["analytics_events"]["Insert"];

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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

    const { data, error } = await query.order("created_at", { ascending: false });

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
    // Public endpoint - no authentication required for tracking
    const supabase = await createClient();
    const headersList = await headers();
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

    // Extract geolocation from Vercel headers
    const country = headersList.get("x-vercel-ip-country") || null;
    const city = headersList.get("x-vercel-ip-city") || null;

    // Extract user agent and referrer from request if not provided in body
    const finalUserAgent = user_agent || headersList.get("user-agent") || null;
    const finalReferrer = referrer || headersList.get("referer") || null;

    const insertData: AnalyticsEventInsert = {
      event_type,
      entity_type,
      entity_id,
      session_id: session_id || null,
      country,
      city,
      user_agent: finalUserAgent,
      referrer: finalReferrer,
        metadata: metadata || null,
    };

    const { data, error } = await (supabase
      .from("analytics_events") as any)
      .insert(insertData)
      .select()
      .single();

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

import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { Database } from "@/lib/supabase/types";

type DailyPoint = { date: string; count: number };
type AnalyticsEvent = Database["public"]["Tables"]["analytics_events"]["Row"];

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const scope = searchParams.get("scope") || "30";
    const { id: faqId } = await params;
    
    // Ensure faqId is a string and trim any whitespace
    const cleanFaqId = String(faqId).trim();
    
    if (!cleanFaqId) {
      return NextResponse.json({ error: "FAQ ID is required" }, { status: 400 });
    }

    // Calculate date range based on scope
    let lookbackDays: number;
    if (scope === "all") {
      lookbackDays = 365; // "all" = 1 year
    } else {
      lookbackDays = parseInt(scope, 10); // "7", "30", "90", "365"
    }

    const now = new Date();
    const lookbackDate = new Date(
      now.getTime() - lookbackDays * 24 * 60 * 60 * 1000
    );
    const lookbackISO = lookbackDate.toISOString();

    // Get all FAQ click events for this specific FAQ
    // First, get all events and filter in code (similar to main stats route)
    let eventsQuery = supabase
      .from("analytics_events")
      .select("*")
      .eq("entity_type", "faq_item")
      .eq("event_type", "link_click")
      .gte("created_at", lookbackISO);

    const { data: allEvents, error: eventsError } = await eventsQuery as { data: AnalyticsEvent[] | null; error: any };

    if (eventsError) {
      return NextResponse.json({ error: eventsError.message }, { status: 500 });
    }

    // Filter by FAQ ID in code (to ensure exact match)
    const events = (allEvents || []).filter((e) => String(e.entity_id).trim() === cleanFaqId);

    // Debug: log query results
    console.log("FAQ Analytics Query:", {
      faqId: cleanFaqId,
      scope,
      allEventsCount: allEvents?.length || 0,
      filteredEventsCount: events.length,
      lookbackISO,
    });

    if (!events || events.length === 0) {
      return NextResponse.json({
        totalFAQClicks: 0,
        faqClicksSeries: [],
        topCountries: [],
      });
    }

    // Total FAQ clicks
    const totalFAQClicks = events.length;

    // Daily aggregation for FAQ clicks
    const faqClicksByDate = new Map<string, number>();
    events.forEach((e) => {
      const date = new Date(e.created_at).toISOString().split("T")[0];
      faqClicksByDate.set(date, (faqClicksByDate.get(date) || 0) + 1);
    });

    const faqClicksSeries: DailyPoint[] = Array.from(faqClicksByDate.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Top countries for this FAQ
    const countryCounts = new Map<string, number>();
    events
      .filter((e) => e.country !== null)
      .forEach((e) => {
        countryCounts.set(
          e.country!,
          (countryCounts.get(e.country!) || 0) + 1
        );
      });

    const topCountries = Array.from(countryCounts.entries())
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return NextResponse.json({
      totalFAQClicks,
      faqClicksSeries,
      topCountries,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}

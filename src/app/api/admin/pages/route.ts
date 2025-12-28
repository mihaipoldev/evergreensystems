import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { getTimestamp, getDuration, debugServerTiming, debugQuery } from "@/lib/debug-performance";

export async function GET(request: Request) {
  const requestStartTime = getTimestamp();
  
  try {
    // Check authentication first using regular client
    const authStartTime = getTimestamp();
    const authClient = await createClient();
    const { data: { user } } = await authClient.auth.getUser();
    const authDuration = getDuration(authStartTime);
    debugServerTiming("API /admin/pages", "Authentication", authDuration, { hasUser: !!user });

    if (!user) {
      const totalDuration = getDuration(requestStartTime);
      debugServerTiming("API /admin/pages", "Total (unauthorized)", totalDuration);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Use regular client - service role was causing connection issues
    // The indexes and query optimizations should still help performance
    const supabase = authClient;

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");

    const queryStartTime = getTimestamp();
    // Optimize: Only select fields needed for sidebar (minimal data)
    // Removed description, updated_at to reduce payload size
    let query = supabase
      .from("pages")
      .select("id, title, type, status, order, created_at");

    // Server-side search filtering
    if (search && search.trim() !== "") {
      const searchPattern = `%${search.trim()}%`;
      // Note: description is not selected, so only search by title
      query = query.ilike("title", searchPattern);
    }

    // Use composite index: order by "order" ASC, created_at DESC
    // This should use idx_pages_order_created_at index
    const dbQueryStartTime = getTimestamp();
    const { data, error } = await query
      .order("order", { ascending: true })
      .order("created_at", { ascending: false });
    const dbQueryDuration = getDuration(dbQueryStartTime);
    
    const queryDuration = getDuration(queryStartTime);
    debugQuery("API /admin/pages", "Pages query", queryDuration, {
      rowCount: data?.length || 0,
      hasSearch: !!search,
      dbQueryTime: dbQueryDuration
    });
    
    // Log if database query is slow
    if (dbQueryDuration > 100) {
      debugServerTiming("API /admin/pages", "⚠️ SLOW DB QUERY", dbQueryDuration, {
        rowCount: data?.length || 0,
        threshold: "100ms"
      });
    }

    if (error) {
      const totalDuration = getDuration(requestStartTime);
      debugServerTiming("API /admin/pages", "Total (ERROR)", totalDuration, { error: error.message });
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const serializeStartTime = getTimestamp();
    const response = NextResponse.json(data, {
      status: 200,
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
    const serializeDuration = getDuration(serializeStartTime);
    debugServerTiming("API /admin/pages", "Response serialization", serializeDuration);
    
    const totalDuration = getDuration(requestStartTime);
    debugServerTiming("API /admin/pages", "Total", totalDuration, { rowCount: data?.length || 0 });
    
    return response;
  } catch (error) {
    const totalDuration = getDuration(requestStartTime);
    debugServerTiming("API /admin/pages", "Total (ERROR)", totalDuration, {
      error: error instanceof Error ? error.message : "An unexpected error occurred"
    });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, type } = body;

    if (!title || !type) {
      return NextResponse.json(
        { error: "title and type are required" },
        { status: 400 }
      );
    }

    const { data, error } = await (supabase
      .from("pages") as any)
      .insert({
        title,
        description: description || null,
        type,
        status: "published",
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Invalidate cache for pages
    revalidateTag("pages", "max");

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

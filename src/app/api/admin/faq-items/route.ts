import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

export async function GET(request: Request) {
  try {
    // Check authentication first using regular client
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Use service role client for admin operations to bypass RLS
    const adminSupabase = createServiceRoleClient();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const status = searchParams.get("status");

    let query = adminSupabase
      .from("faq_items")
      .select("id, question, answer, position, status, created_at, updated_at");

    // Server-side search filtering
    if (search && search.trim() !== "") {
      const searchPattern = `%${search.trim()}%`;
      query = query.or(`question.ilike.${searchPattern},answer.ilike.${searchPattern}`);
    }

    if (status && ["active", "inactive"].includes(status)) {
      query = query.eq("status", status);
    }

    const { data, error } = await query.order("position", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // No cache for admin routes - always fresh data
    return NextResponse.json(data, {
      status: 200,
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Check authentication first using regular client
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Use service role client for admin operations to bypass RLS
    const adminSupabase = createServiceRoleClient();

    const body = await request.json();
    const { question, answer, position, status } = body;

    if (!question || !answer) {
      return NextResponse.json(
        { error: "question and answer are required" },
        { status: 400 }
      );
    }

    const { data, error } = await (adminSupabase.from("faq_items") as any)
      .insert({
        question,
        answer,
        position: position ?? 0,
        status: status && ["active", "inactive"].includes(status) ? status : "active",
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Invalidate cache for FAQ items
    revalidateTag("faq-items", "max");

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

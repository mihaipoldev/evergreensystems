import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

/**
 * Normalize avatar URL to ensure it has a protocol
 * Returns null for empty strings, null, or undefined
 */
function normalizeAvatarUrl(url: string | null | undefined): string | null {
  if (!url || url.trim() === "") return null;
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  // If it looks like a CDN URL (contains .b-cdn.net or similar), add https://
  if (url.includes("b-cdn.net") || url.includes("cdn")) {
    return `https://${url}`;
  }
  return url;
}

/**
 * Normalize testimonial data to ensure avatar URLs have protocols
 */
function normalizeTestimonial(testimonial: any): any {
  return {
    ...testimonial,
    avatar_url: normalizeAvatarUrl(testimonial.avatar_url),
  };
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");

    let query = supabase
      .from("testimonials")
      .select("id, author_name, author_role, company_name, headline, quote, avatar_url, rating, position, created_at, updated_at");

    // Server-side search filtering
    if (search && search.trim() !== "") {
      const searchPattern = `%${search.trim()}%`;
      query = query.or(`author_name.ilike.${searchPattern},quote.ilike.${searchPattern},company_name.ilike.${searchPattern},author_role.ilike.${searchPattern}`);
    }

    const { data, error } = await query
      .order("position", { ascending: true })
      .order("position", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Normalize avatar URLs before returning
    const normalizedData = (data || []).map(normalizeTestimonial);

    // No cache for admin routes - always fresh data
    return NextResponse.json(normalizedData, {
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
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { author_name, author_role, company_name, headline, quote, avatar_url, rating, position } = body;

    if (!author_name) {
      return NextResponse.json(
        { error: "author_name is required" },
        { status: 400 }
      );
    }

    const { data, error } = await (supabase
      .from("testimonials") as any)
      .insert({
        author_name,
        author_role: author_role || null,
        company_name: company_name || null,
        headline: headline || null,
        quote: quote || null,
        avatar_url: avatar_url || null,
        rating: rating ?? null,
        position: position ?? 0,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Invalidate cache for testimonials
    revalidateTag("testimonials", "max");

    // Normalize avatar URL before returning
    const normalizedData = data ? normalizeTestimonial(data) : data;

    return NextResponse.json(normalizedData, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

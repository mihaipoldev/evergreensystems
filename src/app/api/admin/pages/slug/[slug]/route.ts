import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const supabase = await createClient();
    const { slug } = await params;

    // First, get the site_structure entry for this slug
    const { data: siteStructure, error: siteError } = await supabase
      .from("site_structure")
      .select("production_page_id, development_page_id")
      .eq("slug", slug)
      .maybeSingle<{ production_page_id: string | null; development_page_id: string | null }>();

    if (siteError) {
      return NextResponse.json({ error: siteError.message }, { status: 500 });
    }

    if (!siteStructure) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    // Determine environment - for admin API, we might want to show development page
    // But typically we'll return production page unless explicitly requested
    const isDevelopment = process.env.NODE_ENV === 'development';
    const pageId = isDevelopment 
      ? (siteStructure.development_page_id || siteStructure.production_page_id)
      : siteStructure.production_page_id;

    if (!pageId) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    // Then fetch the page by ID
    const { data: page, error: pageError } = await supabase
      .from("pages")
      .select("*")
      .eq("id", pageId)
      .single();

    if (pageError) {
      return NextResponse.json({ error: pageError.message }, { status: 500 });
    }

    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    return NextResponse.json(page, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

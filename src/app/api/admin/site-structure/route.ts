import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const pageId = searchParams.get("pageId");

    if (!pageId) {
      return NextResponse.json(
        { error: "pageId is required" },
        { status: 400 }
      );
    }

    // Query for entries where the page is used as production page
    const { data: productionData, error: productionError } = await supabase
      .from("site_structure")
      .select("page_type, production_page_id, development_page_id")
      .eq("production_page_id", pageId);

    if (productionError) {
      return NextResponse.json({ error: productionError.message }, { status: 500 });
    }

    // Query for entries where the page is used as development page
    const { data: developmentData, error: developmentError } = await supabase
      .from("site_structure")
      .select("page_type, production_page_id, development_page_id")
      .eq("development_page_id", pageId);

    if (developmentError) {
      return NextResponse.json({ error: developmentError.message }, { status: 500 });
    }

    // Combine and deduplicate entries
    type SiteStructureEntry = {
      page_type: string;
      production_page_id: string | null;
      development_page_id: string | null;
    };
    
    const allEntries = new Map<string, SiteStructureEntry>();
    const productionEntries: SiteStructureEntry[] = (productionData || []) as SiteStructureEntry[];
    const developmentEntries: SiteStructureEntry[] = (developmentData || []) as SiteStructureEntry[];
    
    productionEntries.forEach(entry => {
      allEntries.set(entry.page_type, entry);
    });
    
    developmentEntries.forEach(entry => {
      const existing = allEntries.get(entry.page_type);
      if (existing) {
        allEntries.set(entry.page_type, {
          ...existing,
          development_page_id: entry.development_page_id,
        });
      } else {
        allEntries.set(entry.page_type, entry);
      }
    });

    const result = Array.from(allEntries.values()).map(entry => {
      const isProduction = entry.production_page_id === pageId;
      const isDevelopment = entry.development_page_id === pageId;
      
      let environment: 'production' | 'development' | 'both';
      if (isProduction && isDevelopment) {
        environment = 'both';
      } else if (isProduction) {
        environment = 'production';
      } else {
        environment = 'development';
      }

      return {
        page_type: entry.page_type,
        environment,
      };
    });

    return NextResponse.json(result, { status: 200 });
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
    const { page_type, production_page_id, development_page_id, slug } = body;

    if (!page_type || !slug) {
      return NextResponse.json(
        { error: "page_type and slug are required" },
        { status: 400 }
      );
    }

    // Check if entry exists
    const { data: existing } = await supabase
      .from("site_structure")
      .select("id")
      .eq("page_type", page_type)
      .maybeSingle();

    if (existing) {
      // Update existing entry
      const { error } = await (supabase
        .from("site_structure") as any)
        .update({
          production_page_id: production_page_id || null,
          development_page_id: development_page_id || null,
          slug,
          updated_at: new Date().toISOString(),
        })
        .eq("page_type", page_type);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    } else {
      // Create new entry
      const { error } = await (supabase
        .from("site_structure") as any)
        .insert({
          page_type,
          slug,
          production_page_id: production_page_id || null,
          development_page_id: development_page_id || null,
        });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    // Invalidate cache
    revalidateTag("site-structure", "max");
    revalidateTag(`page-slug-${slug}`, "max");

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

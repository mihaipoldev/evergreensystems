import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { Database } from "@/lib/supabase/types";
import { revalidateTag } from "next/cache";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: pageId } = await params;
    const body = await request.json();
    const { section_id, position } = body;

    if (!section_id) {
      return NextResponse.json(
        { error: "section_id is required" },
        { status: 400 }
      );
    }

    // Check if section is already connected to this page
    const { data: existing } = await supabase
      .from("page_sections")
      .select("id")
      .eq("page_id", pageId)
      .eq("section_id", section_id)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: "Section is already connected to this page" },
        { status: 400 }
      );
    }

    // Calculate position: use provided position, or auto-calculate max position + 1
    let finalPosition = position;
    if (finalPosition === undefined || finalPosition === null) {
      const { data: existingSections } = await supabase
        .from("page_sections")
        .select("position")
        .eq("page_id", pageId)
        .order("position", { ascending: false })
        .limit(1);
      
      if (existingSections && existingSections.length > 0) {
        const firstSection = existingSections[0] as { position: number | null } | null;
        if (firstSection && firstSection.position !== null && firstSection.position !== undefined) {
          finalPosition = firstSection.position + 1;
        } else {
          finalPosition = 0;
        }
      } else {
        finalPosition = 0;
      }
    }

    // Create new page_section connection
    const pageSectionToInsert: Database["public"]["Tables"]["page_sections"]["Insert"] = {
      page_id: pageId,
      section_id,
      position: finalPosition,
      status: "draft",
    };

    const { data: newPageSection, error: insertError } = await supabase
      .from("page_sections")
      .insert(pageSectionToInsert as any)
      .select()
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    // Invalidate cache
    revalidateTag("sections", "max");
    revalidateTag(`page-sections-${pageId}`, "max");

    return NextResponse.json(newPageSection, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

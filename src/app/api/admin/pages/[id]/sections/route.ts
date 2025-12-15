import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { Database } from "@/lib/supabase/types";
import { revalidateTag } from "next/cache";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { sections } = body;

    if (!Array.isArray(sections)) {
      return NextResponse.json(
        { error: "sections must be an array" },
        { status: 400 }
      );
    }

    // Delete existing page_sections for this page
    const { error: deleteError } = await supabase
      .from("page_sections")
      .delete()
      .eq("page_id", id);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    // Insert new page_sections if any
    if (sections.length > 0) {
      const pageSectionsToInsert: Database["public"]["Tables"]["page_sections"]["Insert"][] = sections.map((section: any) => ({
        page_id: id,
        section_id: section.section_id,
        position: section.position,
        status: section.status || "draft",
      }));

      const { error: insertError } = await supabase
        .from("page_sections")
        .insert(pageSectionsToInsert as any);

      if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 500 });
      }
    }

    // Invalidate cache for pages, sections, and page sections
    revalidateTag("pages", "max");
    revalidateTag("sections", "max");
    revalidateTag(`page-sections-${id}`, "max");
    // Also invalidate page slug cache if we can get it
    const { data: pageData } = await supabase
      .from("pages")
      .select("slug")
      .eq("id", id)
      .single();
    if ((pageData as any)?.slug) {
      revalidateTag(`page-${(pageData as any).slug}`, "max");
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

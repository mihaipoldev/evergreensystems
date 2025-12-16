import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import type { Database } from "@/lib/supabase/types";

type Page = Database["public"]["Tables"]["pages"]["Row"];
type PageSection = Database["public"]["Tables"]["page_sections"]["Row"];

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

    const { id } = await params;

    // Use service role client to bypass RLS for admin operations
    const adminSupabase = createServiceRoleClient();

    // Fetch original page
    const { data: original, error: fetchError } = await adminSupabase
      .from("pages")
      .select("*")
      .eq("id", id)
      .single<Page>();

    if (fetchError || !original) {
      return NextResponse.json(
        { error: "Page not found" },
        { status: 404 }
      );
    }

    // Generate duplicate title with " (Copy)" suffix
    let duplicateTitle = `${original.title} (Copy)`;
    
    // Check if title already exists, append number if needed
    let counter = 1;
    while (true) {
      const { data: existing } = await adminSupabase
        .from("pages")
        .select("id")
        .eq("title", duplicateTitle)
        .maybeSingle();
      
      if (!existing) break;
      counter++;
      duplicateTitle = `${original.title} (Copy ${counter})`;
    }

    // Create duplicate page
    const { data: duplicatePage, error: duplicateError } = await (adminSupabase
      .from("pages") as any)
      .insert({
        title: duplicateTitle,
        description: original.description,
        type: original.type,
        status: "draft", // Always set duplicate to draft
      })
      .select()
      .single();

    if (duplicateError) {
      return NextResponse.json(
        { error: duplicateError.message },
        { status: 500 }
      );
    }

    const newPageId = duplicatePage.id;

    // Fetch all page_sections for the original page
    const { data: pageSections } = await adminSupabase
      .from("page_sections")
      .select("*")
      .eq("page_id", id)
      .order("position", { ascending: true })
      .returns<PageSection[]>();

    // Create duplicate page_sections entries
    if (pageSections && pageSections.length > 0) {
      const pageSectionsInserts = pageSections.map((item) => ({
        page_id: newPageId,
        section_id: item.section_id,
        position: item.position,
        status: item.status || "draft",
      }));

      const { error: pageSectionsError } = await (adminSupabase
        .from("page_sections") as any)
        .insert(pageSectionsInserts);

      if (pageSectionsError) {
        // Log error but don't fail the request
        console.error("Error duplicating page sections:", pageSectionsError);
      }
    }

    // Invalidate cache
    revalidateTag("pages", "max");

    return NextResponse.json(
      duplicatePage,
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}

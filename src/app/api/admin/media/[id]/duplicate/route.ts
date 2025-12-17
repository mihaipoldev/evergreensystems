import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import type { Database } from "@/lib/supabase/types";

type Media = Database["public"]["Tables"]["media"]["Row"];

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
    const { searchParams } = new URL(request.url);
    const sectionId = searchParams.get("section_id");

    // Use service role client to bypass RLS for admin operations
    const adminSupabase = createServiceRoleClient();

    // Fetch original media
    const { data: original, error: fetchError } = await adminSupabase
      .from("media")
      .select("*")
      .eq("id", id)
      .single<Media>();

    if (fetchError || !original) {
      return NextResponse.json(
        { error: "Media not found" },
        { status: 404 }
      );
    }

    // Generate duplicate name with version number (V2, V3, etc.) if name exists
    let duplicateName: string | null = null;
    
    if (original.name) {
      // Extract base name (remove existing version if present)
      const baseName = original.name.replace(/\s+V\d+$/, '');
      
      // Find the next version number
      let version = 2;
      while (true) {
        duplicateName = `${baseName} V${version}`;
        const { data: existing } = await adminSupabase
          .from("media")
          .select("id")
          .eq("name", duplicateName)
          .maybeSingle();
        
        if (!existing) break;
        version++;
      }
    }

    // Create duplicate media (same URL/embed_id - media files aren't duplicated)
    const { data: duplicate, error: duplicateError } = await (adminSupabase
      .from("media") as any)
      .insert({
        type: original.type,
        source_type: original.source_type,
        url: original.url,
        embed_id: original.embed_id,
        name: duplicateName,
        thumbnail_url: original.thumbnail_url,
        duration: original.duration,
      })
      .select()
      .single();

    if (duplicateError) {
      return NextResponse.json(
        { error: duplicateError.message },
        { status: 500 }
      );
    }

    // If section_id is provided, create junction table entry
    if (sectionId) {
      // Get max sort_order for this section
      const { data: maxSortOrderData } = await adminSupabase
        .from("section_media")
        .select("sort_order")
        .eq("section_id", sectionId)
        .order("sort_order", { ascending: false })
        .limit(1)
        .maybeSingle<{ sort_order: number }>();

      const newSortOrder = maxSortOrderData?.sort_order
        ? maxSortOrderData.sort_order + 1
        : 1;

      const { error: junctionError } = await (adminSupabase
        .from("section_media") as any)
        .insert({
          section_id: sectionId,
          media_id: duplicate.id,
          role: "main",
          sort_order: newSortOrder,
        });

      if (junctionError) {
        console.error("Error creating section media connection:", junctionError);
        // Don't fail the request, just log the error
      }
    }

    // Invalidate cache
    revalidateTag("media", "max");

    return NextResponse.json(duplicate, { status: 201 });
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

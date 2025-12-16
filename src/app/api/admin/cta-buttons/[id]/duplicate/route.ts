import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import type { Database } from "@/lib/supabase/types";

type CTAButton = Database["public"]["Tables"]["cta_buttons"]["Row"];

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

    // Fetch original CTA button
    const { data: original, error: fetchError } = await adminSupabase
      .from("cta_buttons")
      .select("*")
      .eq("id", id)
      .single<CTAButton>();

    if (fetchError || !original) {
      return NextResponse.json(
        { error: "CTA button not found" },
        { status: 404 }
      );
    }

    // Generate duplicate label with " (Copy)" suffix
    let duplicateLabel = `${original.label} (Copy)`;
    
    // Check if label already exists, append number if needed
    let counter = 1;
    while (true) {
      const { data: existing } = await adminSupabase
        .from("cta_buttons")
        .select("id")
        .eq("label", duplicateLabel)
        .maybeSingle();
      
      if (!existing) break;
      counter++;
      duplicateLabel = `${original.label} (Copy ${counter})`;
    }

    // Get max position to place duplicate at end
    const { data: maxPositionData } = await adminSupabase
      .from("cta_buttons")
      .select("position")
      .order("position", { ascending: false })
      .limit(1)
      .maybeSingle<{ position: number }>();

    const newPosition = maxPositionData?.position ? maxPositionData.position + 1 : 0;

    // Create duplicate CTA button (status is in section_cta_buttons, not cta_buttons)
    const { data: duplicate, error: duplicateError } = await (adminSupabase
      .from("cta_buttons") as any)
      .insert({
        label: duplicateLabel,
        url: original.url,
        style: original.style,
        icon: original.icon,
        position: newPosition,
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
      // Get max position for this section
      const { data: maxSectionPositionData } = await adminSupabase
        .from("section_cta_buttons")
        .select("position")
        .eq("section_id", sectionId)
        .order("position", { ascending: false })
        .limit(1)
        .maybeSingle<{ position: number }>();

      const newSectionPosition = maxSectionPositionData?.position
        ? maxSectionPositionData.position + 1
        : 0;

      const { error: junctionError } = await (adminSupabase
        .from("section_cta_buttons") as any)
        .insert({
          section_id: sectionId,
          cta_button_id: duplicate.id,
          position: newSectionPosition,
          status: "draft", // Status is in junction table, default to draft
        });

      if (junctionError) {
        console.error("Error creating section CTA connection:", junctionError);
        // Don't fail the request, just log the error
      }
    }

    // Invalidate cache
    revalidateTag("cta-buttons", "max");

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

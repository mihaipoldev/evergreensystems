import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import type { Database } from "@/lib/supabase/types";

type FAQItem = Database["public"]["Tables"]["faq_items"]["Row"];

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

    // Fetch original FAQ item
    const { data: original, error: fetchError } = await adminSupabase
      .from("faq_items")
      .select("*")
      .eq("id", id)
      .single<FAQItem>();

    if (fetchError || !original) {
      return NextResponse.json(
        { error: "FAQ item not found" },
        { status: 404 }
      );
    }

    // Generate duplicate question with version number (V2, V3, etc.)
    // Extract base name (remove existing version if present)
    const baseName = original.question.replace(/\s+V\d+$/, '');
    
    // Find the next version number
    let version = 2;
    let duplicateQuestion: string;
    while (true) {
      duplicateQuestion = `${baseName} V${version}`;
      const { data: existing } = await adminSupabase
        .from("faq_items")
        .select("id")
        .eq("question", duplicateQuestion)
        .maybeSingle();
      
      if (!existing) break;
      version++;
    }

    // Get max position to place duplicate at end
    const { data: maxPositionData } = await adminSupabase
      .from("faq_items")
      .select("position")
      .order("position", { ascending: false })
      .limit(1)
      .maybeSingle<{ position: number }>();

    const newPosition = maxPositionData?.position ? maxPositionData.position + 1 : 0;

    // Create duplicate FAQ item
    // Note: status is NOT in faq_items table, it's in section_faq_items junction table
    const { data: duplicate, error: duplicateError } = await (adminSupabase
      .from("faq_items") as any)
      .insert({
        question: duplicateQuestion,
        answer: original.answer,
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
        .from("section_faq_items")
        .select("position")
        .eq("section_id", sectionId)
        .order("position", { ascending: false })
        .limit(1)
        .maybeSingle<{ position: number }>();

      const newSectionPosition = maxSectionPositionData?.position
        ? maxSectionPositionData.position + 1
        : 0;

      const { error: junctionError } = await (adminSupabase
        .from("section_faq_items") as any)
        .insert({
          section_id: sectionId,
          faq_item_id: duplicate.id,
          position: newSectionPosition,
          status: "draft", // Set default status when creating junction entry
        });

      if (junctionError) {
        console.error("Error creating section FAQ connection:", junctionError);
        // Don't fail the request, just log the error
      }
    }

    // Invalidate cache
    revalidateTag("faq-items", "max");

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

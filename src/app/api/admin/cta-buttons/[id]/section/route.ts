import { NextResponse } from "next/server";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Auth check
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminSupabase = createServiceRoleClient();
    const body = await request.json();
    const { section_id } = body as { section_id?: string | null };

    if (section_id !== null && section_id !== undefined && typeof section_id !== "string") {
      return NextResponse.json({ error: "section_id must be a string or null" }, { status: 400 });
    }

    // Remove existing links for this CTA (enforce single section)
    const { error: deleteError } = await adminSupabase
      .from("section_cta_buttons")
      .delete()
      .eq("cta_button_id", id);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    // If a section is provided, insert the link
    if (section_id) {
      const { error: insertError } = await (adminSupabase
        .from("section_cta_buttons") as any)
        .insert({
          section_id,
          cta_button_id: id,
          position: 0,
        });

      if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 500 });
      }
    }

    return NextResponse.json({ message: "Section link updated" }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

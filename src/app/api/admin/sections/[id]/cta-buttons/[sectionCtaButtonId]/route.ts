import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; sectionCtaButtonId: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Use service role client to bypass RLS for admin operations
    const adminSupabase = createServiceRoleClient();

    const { id: sectionId, sectionCtaButtonId } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status || !["published", "draft", "deactivated"].includes(status)) {
      return NextResponse.json(
        { error: "status must be one of: published, draft, deactivated" },
        { status: 400 }
      );
    }

    const { data, error } = await (adminSupabase
      .from("section_cta_buttons") as any)
      .update({ status })
      .eq("id", sectionCtaButtonId)
      .eq("section_id", sectionId)
      .select(`
        *,
        cta_buttons (*)
      `)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: "Section CTA button not found" }, { status: 404 });
    }

    // Transform response
    const ctaButtonWithMetadata = {
      ...data.cta_buttons,
      section_cta_button: {
        id: data.id,
        section_id: data.section_id,
        cta_button_id: data.cta_button_id,
        position: data.position,
        status: data.status,
        created_at: data.created_at,
      },
    };

    revalidateTag("cta-buttons", "max");
    revalidateTag("sections", "max");

    return NextResponse.json(ctaButtonWithMetadata, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; sectionFaqItemId: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Use service role client to bypass RLS for admin operations
    const adminSupabase = createServiceRoleClient();

    const { id: sectionId, sectionFaqItemId } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status || !["published", "draft", "deactivated"].includes(status)) {
      return NextResponse.json(
        { error: "status must be one of: published, draft, deactivated" },
        { status: 400 }
      );
    }

    const { data, error } = await (adminSupabase
      .from("section_faq_items") as any)
      .update({ status })
      .eq("id", sectionFaqItemId)
      .eq("section_id", sectionId)
      .select(`
        *,
        faq_items (*)
      `)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: "Section FAQ item not found" }, { status: 404 });
    }

    // Transform response
    const faqItemWithMetadata = {
      ...(data as any).faq_items,
      section_faq_item: {
        id: (data as any).id,
        section_id: (data as any).section_id,
        faq_item_id: (data as any).faq_item_id,
        position: (data as any).position,
        status: (data as any).status,
        created_at: (data as any).created_at,
      },
    };

    revalidateTag("faq-items", "max");
    revalidateTag("sections", "max");

    return NextResponse.json(faqItemWithMetadata, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

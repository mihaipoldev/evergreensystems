import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Use service role client to bypass RLS for admin operations
    const adminSupabase = createServiceRoleClient();

    const { id: sectionId } = await params;

    const { data, error } = await adminSupabase
      .from("section_faq_items")
      .select(`
        *,
        faq_items (*)
      `)
      .eq("section_id", sectionId)
      .order("position", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const faqItems = (data || [])
      .filter((item: any) => item.faq_items !== null)
      .map((item: any) => ({
        ...item.faq_items,
        section_faq_item: {
          id: item.id,
          position: item.position,
          status: item.status || "draft",
          created_at: item.created_at,
        },
      }));

    return NextResponse.json(faqItems, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

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

    const { id: sectionId } = await params;
    const body = await request.json();
    const { faq_item_id, position } = body;

    if (!faq_item_id) {
      return NextResponse.json(
        { error: "faq_item_id is required" },
        { status: 400 }
      );
    }

    // Check if FAQ item is already connected to this section
    const { data: existing } = await supabase
      .from("section_faq_items")
      .select("id")
      .eq("section_id", sectionId)
      .eq("faq_item_id", faq_item_id)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: "FAQ item is already connected to this section" },
        { status: 400 }
      );
    }

    const { data, error } = await (supabase
      .from("section_faq_items") as any)
      .insert({
        section_id: sectionId,
        faq_item_id,
        position: position ?? 0,
        status: "draft",
      })
      .select(`
        *,
        faq_items (*)
      `)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Transform response
    const faqItemWithSection = data && (data as any).faq_items ? {
      ...(data as any).faq_items,
      section_faq_item: {
        id: (data as any).id,
        position: (data as any).position,
        status: (data as any).status || "draft",
        created_at: (data as any).created_at,
      },
    } : null;

    revalidateTag("faq-items", "max");
    revalidateTag("sections", "max");

    return NextResponse.json(faqItemWithSection, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Use service role client to bypass RLS for admin operations
    const adminSupabase = createServiceRoleClient();

    const { id: sectionId } = await params;
    const { searchParams } = new URL(request.url);
    const sectionFaqItemId = searchParams.get("section_faq_item_id");

    if (!sectionFaqItemId) {
      return NextResponse.json(
        { error: "section_faq_item_id is required" },
        { status: 400 }
      );
    }

    const { error } = await adminSupabase
      .from("section_faq_items")
      .delete()
      .eq("id", sectionFaqItemId)
      .eq("section_id", sectionId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    revalidateTag("faq-items", "max");
    revalidateTag("sections", "max");

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

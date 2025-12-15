import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
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

    const { id: sectionId } = await params;
    const body = await request.json();
    const { items } = body;

    if (!Array.isArray(items)) {
      return NextResponse.json(
        { error: "items must be an array" },
        { status: 400 }
      );
    }

    if (items.length === 0) {
      return NextResponse.json({ success: true }, { status: 200 });
    }

    // Validate all items have required fields
    for (const item of items) {
      if (!item.section_software_id || item.order === undefined) {
        return NextResponse.json(
          { error: "Each item must have section_software_id and order" },
          { status: 400 }
        );
      }
    }

    // Use service role client for admin operations
    const adminSupabase = createServiceRoleClient();

    // Update orders for all items in parallel
    const updates = items.map((item: { section_software_id: string; order: number }) =>
      (adminSupabase
        .from("section_softwares") as any)
        .update({ order: item.order })
        .eq("id", item.section_software_id)
        .eq("section_id", sectionId)
    );

    const results = await Promise.all(updates);
    const errors = results.filter((result) => result.error);

    if (errors.length > 0) {
      return NextResponse.json(
        { error: errors[0].error?.message || "Failed to update orders" },
        { status: 500 }
      );
    }

    revalidateTag("softwares", "max");
    revalidateTag("sections", "max");

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

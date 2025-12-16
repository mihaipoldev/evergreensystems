import { createClient } from "@/lib/supabase/server";
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

    const { id: pageId } = await params;
    const body = await request.json();
    const { items } = body;

    if (!Array.isArray(items)) {
      return NextResponse.json(
        { error: "items must be an array of { id, position } objects" },
        { status: 400 }
      );
    }

    // Update positions in page_sections table
    const updates = items.map((item: { id: string; position: number }) =>
      (supabase.from("page_sections") as any)
        .update({ position: item.position })
        .eq("id", item.id)
        .eq("page_id", pageId)
    );

    const results = await Promise.all(updates);
    const errors = results.filter((result) => result.error);

    if (errors.length > 0) {
      return NextResponse.json(
        { error: errors[0].error?.message || "Failed to update positions" },
        { status: 500 }
      );
    }

    // Invalidate cache
    revalidateTag("sections", "max");
    revalidateTag(`page-sections-${pageId}`, "max");

    return NextResponse.json({ message: "Sections reordered successfully" }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

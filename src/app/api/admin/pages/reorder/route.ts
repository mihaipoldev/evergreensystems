import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { items } = body;

    if (!Array.isArray(items)) {
      return NextResponse.json(
        { error: "items must be an array of { id, order } objects" },
        { status: 400 }
      );
    }

    // Update orders in a transaction-like manner
    const updates = items.map((item: { id: string; order: number }) =>
      (supabase
        .from("pages") as any)
        .update({ order: item.order })
        .eq("id", item.id)
    );

    const results = await Promise.all(updates);
    const errors = results.filter((result) => result.error);

    if (errors.length > 0) {
      return NextResponse.json(
        { error: errors[0].error?.message || "Failed to update orders" },
        { status: 500 }
      );
    }

    // Invalidate cache for pages
    revalidateTag("pages", "max");

    return NextResponse.json({ message: "Pages reordered successfully" }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

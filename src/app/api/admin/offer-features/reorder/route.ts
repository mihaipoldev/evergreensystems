import { revalidateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const authHeader = request.headers.get("Authorization");
    const accessToken = authHeader?.startsWith("Bearer ")
      ? authHeader.replace("Bearer ", "")
      : undefined;
    const {
      data: { user },
    } = accessToken
      ? await supabase.auth.getUser(accessToken)
      : await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { items } = body;

    if (!Array.isArray(items)) {
      return NextResponse.json(
        { error: "items must be an array of { id, position } objects" },
        { status: 400 }
      );
    }

    const updates = items.map((item: { id: string; position: number }) =>
      (supabase.from("offer_features") as any).update({ position: item.position }).eq("id", item.id)
    );

    const results = await Promise.all(updates);
    const errors = results.filter((result) => result.error);

    if (errors.length > 0) {
      return NextResponse.json(
        { error: errors[0].error?.message || "Failed to update positions" },
        { status: 500 }
      );
    }

    revalidateTag("offer-features", "max");
    return NextResponse.json({ message: "Features reordered successfully" }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

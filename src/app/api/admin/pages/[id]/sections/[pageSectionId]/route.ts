import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import type { Database } from "@/lib/supabase/types";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; pageSectionId: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: pageId, pageSectionId } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status || !["published", "draft", "deactivated"].includes(status)) {
      return NextResponse.json(
        { error: "status must be one of: published, draft, deactivated" },
        { status: 400 }
      );
    }

    const { error: updateError } = await (supabase
      .from("page_sections") as any)
      .update({ status })
      .eq("id", pageSectionId)
      .eq("page_id", pageId);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // Invalidate cache
    revalidateTag("sections", "max");
    revalidateTag(`page-sections-${pageId}`, "max");
    
    // Also invalidate page slug cache
    const { data: pageData } = await supabase
      .from("pages")
      .select("slug")
      .eq("id", pageId)
      .single();
    if ((pageData as any)?.slug) {
      revalidateTag(`page-${(pageData as any).slug}`, "max");
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; pageSectionId: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: pageId, pageSectionId } = await params;

    const { error: deleteError } = await supabase
      .from("page_sections")
      .delete()
      .eq("id", pageSectionId)
      .eq("page_id", pageId);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    // Invalidate cache
    revalidateTag("sections", "max");
    revalidateTag(`page-sections-${pageId}`, "max");
    
    // Also invalidate page slug cache
    const { data: pageData } = await supabase
      .from("pages")
      .select("slug")
      .eq("id", pageId)
      .single();
    if ((pageData as any)?.slug) {
      revalidateTag(`page-${(pageData as any).slug}`, "max");
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

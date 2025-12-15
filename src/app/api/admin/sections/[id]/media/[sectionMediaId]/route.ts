import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; sectionMediaId: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: sectionId, sectionMediaId } = await params;
    const body = await request.json();
    const { status } = body;
    const adminSupabase = createServiceRoleClient();

    if (!status || !["published", "draft", "deactivated"].includes(status)) {
      return NextResponse.json(
        { error: "Valid status is required (published, draft, or deactivated)" },
        { status: 400 }
      );
    }

    const { data, error } = await (adminSupabase
      .from("section_media") as any)
      .update({ status })
      .eq("id", sectionMediaId)
      .eq("section_id", sectionId)
      .select(`
        *,
        media (*)
      `)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Transform response
    const mediaWithMetadata = data && (data as any).media ? {
      ...(data as any).media,
      section_media: {
        id: (data as any).id,
        section_id: (data as any).section_id,
        media_id: (data as any).media_id,
        role: (data as any).role,
        sort_order: (data as any).sort_order,
        status: (data as any).status,
        created_at: (data as any).created_at,
      },
    } : null;

    revalidateTag("sections", "max");

    return NextResponse.json(mediaWithMetadata, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

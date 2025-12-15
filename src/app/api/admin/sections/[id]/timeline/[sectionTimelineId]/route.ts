import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; sectionTimelineId: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: sectionId, sectionTimelineId } = await params;
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
      .from("section_timeline") as any)
      .update({ status })
      .eq("id", sectionTimelineId)
      .eq("section_id", sectionId)
      .select(`
        *,
        timeline (*)
      `)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Transform response
    const timelineWithSection = data && (data as any).timeline ? {
      ...(data as any).timeline,
      section_timeline: {
        id: (data as any).id,
        position: (data as any).position,
        status: (data as any).status,
        created_at: (data as any).created_at,
      },
    } : null;

    revalidateTag("timeline", "max");
    revalidateTag("sections", "max");

    return NextResponse.json(timelineWithSection, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

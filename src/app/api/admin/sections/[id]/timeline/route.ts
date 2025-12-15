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

    const { id: sectionId } = await params;
    const adminSupabase = createServiceRoleClient();

    const { data, error } = await adminSupabase
      .from("section_timeline")
      .select(`
        *,
        timeline (*)
      `)
      .eq("section_id", sectionId)
      .order("position", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const timelineItems = (data || [])
      .filter((item: any) => item.timeline !== null)
      .map((item: any) => ({
        ...item.timeline,
        section_timeline: {
          id: item.id,
          position: item.position,
          status: item.status,
          created_at: item.created_at,
        },
      }));

    return NextResponse.json(timelineItems, { status: 200 });
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
    const { timeline_id, position } = body;

    if (!timeline_id) {
      return NextResponse.json(
        { error: "timeline_id is required" },
        { status: 400 }
      );
    }

    // Check if timeline item is already connected to this section
    const { data: existing } = await supabase
      .from("section_timeline")
      .select("id")
      .eq("section_id", sectionId)
      .eq("timeline_id", timeline_id)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: "Timeline item is already connected to this section" },
        { status: 400 }
      );
    }

    const { data, error } = await (supabase
      .from("section_timeline") as any)
      .insert({
        section_id: sectionId,
        timeline_id,
        position: position ?? 0,
      })
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
        created_at: (data as any).created_at,
      },
    } : null;

    revalidateTag("timeline", "max");
    revalidateTag("sections", "max");

    return NextResponse.json(timelineWithSection, { status: 201 });
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

    const { id: sectionId } = await params;
    const { searchParams } = new URL(request.url);
    const sectionTimelineId = searchParams.get("section_timeline_id");
    const adminSupabase = createServiceRoleClient();

    if (!sectionTimelineId) {
      return NextResponse.json(
        { error: "section_timeline_id is required" },
        { status: 400 }
      );
    }

    const { error } = await adminSupabase
      .from("section_timeline")
      .delete()
      .eq("id", sectionTimelineId)
      .eq("section_id", sectionId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    revalidateTag("timeline", "max");
    revalidateTag("sections", "max");

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

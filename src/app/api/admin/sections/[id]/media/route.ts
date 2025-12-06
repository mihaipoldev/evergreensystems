import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

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

    const { id } = await params;

    // Get all section_media for this section with joined media data
    const { data, error } = await ((supabase
      .from("section_media") as any)
      .select(`
        *,
        media (*)
      `)
      .eq("section_id", id)
      .order("sort_order", { ascending: true }) as Promise<{ data: any[] | null; error: any }>);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Transform the data to include media with section_media metadata
    const mediaWithMetadata = (data || []).map((item: any) => ({
      ...item.media,
      section_media: {
        id: item.id,
        section_id: item.section_id,
        media_id: item.media_id,
        role: item.role,
        sort_order: item.sort_order,
        created_at: item.created_at,
      },
    }));

    return NextResponse.json(mediaWithMetadata, { status: 200 });
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

    const { id } = await params;
    const body = await request.json();
    const { media_id, role = "main", sort_order } = body;

    if (!media_id) {
      return NextResponse.json(
        { error: "media_id is required" },
        { status: 400 }
      );
    }

    // Get current max sort_order for this section
    let newSortOrder = sort_order;
    if (!newSortOrder) {
      const { data: existing } = await ((supabase
        .from("section_media") as any)
        .select("sort_order")
        .eq("section_id", id)
        .order("sort_order", { ascending: false })
        .limit(1)
        .single() as Promise<{ data: { sort_order: number } | null }>);

      newSortOrder = existing?.sort_order ? existing.sort_order + 1 : 1;
    }

    // Check if relationship already exists
    const { data: existingRelationship } = await ((supabase
      .from("section_media") as any)
      .select("id")
      .eq("section_id", id)
      .eq("media_id", media_id)
      .single() as Promise<{ data: { id: string } | null }>);

    if (existingRelationship) {
      return NextResponse.json(
        { error: "Media is already associated with this section" },
        { status: 400 }
      );
    }

    const { data: sectionMedia, error: sectionMediaError } = await ((supabase
      .from("section_media") as any)
      .insert({
        section_id: id,
        media_id,
        role,
        sort_order: newSortOrder,
      })
      .select(`
        *,
        media (*)
      `)
      .single() as Promise<{ data: any; error: any }>);

    if (sectionMediaError) {
      return NextResponse.json({ error: sectionMediaError.message }, { status: 500 });
    }

    // Transform response
    const mediaWithMetadata = {
      ...sectionMedia.media,
      section_media: {
        id: sectionMedia.id,
        section_id: sectionMedia.section_id,
        media_id: sectionMedia.media_id,
        role: sectionMedia.role,
        sort_order: sectionMedia.sort_order,
        created_at: sectionMedia.created_at,
      },
    };

    return NextResponse.json(mediaWithMetadata, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { section_media_id, role, sort_order } = body;

    if (!section_media_id) {
      return NextResponse.json(
        { error: "section_media_id is required" },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (role !== undefined) updateData.role = role;
    if (sort_order !== undefined) updateData.sort_order = sort_order;

    const { data: sectionMedia, error: sectionMediaError } = await ((supabase
      .from("section_media") as any)
      .update(updateData)
      .eq("id", section_media_id)
      .eq("section_id", id)
      .select(`
        *,
        media (*)
      `)
      .single() as Promise<{ data: any; error: any }>);

    if (sectionMediaError) {
      return NextResponse.json({ error: sectionMediaError.message }, { status: 500 });
    }

    // Transform response
    const mediaWithMetadata = {
      ...sectionMedia.media,
      section_media: {
        id: sectionMedia.id,
        section_id: sectionMedia.section_id,
        media_id: sectionMedia.media_id,
        role: sectionMedia.role,
        sort_order: sectionMedia.sort_order,
        created_at: sectionMedia.created_at,
      },
    };

    return NextResponse.json(mediaWithMetadata, { status: 200 });
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

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const sectionMediaId = searchParams.get("section_media_id");
    const mediaId = searchParams.get("media_id");

    if (!sectionMediaId && !mediaId) {
      return NextResponse.json(
        { error: "Either section_media_id or media_id is required" },
        { status: 400 }
      );
    }

    let query = (supabase.from("section_media") as any).delete().eq("section_id", id);

    if (sectionMediaId) {
      query = query.eq("id", sectionMediaId);
    } else if (mediaId) {
      query = query.eq("media_id", mediaId);
    }

    const { error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Media removed from section successfully" }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

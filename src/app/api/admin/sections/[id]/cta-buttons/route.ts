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

    // Get all section_cta_buttons for this section with joined cta_buttons data
    const { data, error } = await supabase
      .from("section_cta_buttons")
      .select(`
        *,
        cta_buttons (*)
      `)
      .eq("section_id", id)
      .order("position", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Transform the data to include cta_buttons with section_cta_buttons metadata
    const ctaButtonsWithMetadata = (data || []).map((item: any) => ({
      ...item.cta_buttons,
      section_cta_button: {
        id: item.id,
        section_id: item.section_id,
        cta_button_id: item.cta_button_id,
        position: item.position,
        created_at: item.created_at,
      },
    }));

    return NextResponse.json(ctaButtonsWithMetadata, { status: 200 });
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
    const { cta_button_id, position } = body;

    if (!cta_button_id) {
      return NextResponse.json(
        { error: "cta_button_id is required" },
        { status: 400 }
      );
    }

    // Get current max position for this section
    let newPosition = position;
    if (newPosition === undefined || newPosition === null) {
      const { data: existing } = await ((supabase
        .from("section_cta_buttons") as any)
        .select("position")
        .eq("section_id", id)
        .order("position", { ascending: false })
        .limit(1)
        .single() as Promise<{ data: { position: number } | null }>);

      newPosition = existing?.position !== undefined ? existing.position + 1 : 0;
    }

    // Check if relationship already exists
    const { data: existing } = await supabase
      .from("section_cta_buttons")
      .select("id")
      .eq("section_id", id)
      .eq("cta_button_id", cta_button_id)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "CTA button is already associated with this section" },
        { status: 400 }
      );
    }

    const { data: sectionCTA, error: sectionCTAError } = await ((supabase
      .from("section_cta_buttons") as any)
      .insert({
        section_id: id,
        cta_button_id,
        position: newPosition,
      })
      .select(`
        *,
        cta_buttons (*)
      `)
      .single() as Promise<{ data: any; error: any }>);

    if (sectionCTAError) {
      return NextResponse.json({ error: sectionCTAError.message }, { status: 500 });
    }

    // Transform response
    const ctaButtonWithMetadata = {
      ...sectionCTA.cta_buttons,
      section_cta_button: {
        id: sectionCTA.id,
        section_id: sectionCTA.section_id,
        cta_button_id: sectionCTA.cta_button_id,
        position: sectionCTA.position,
        created_at: sectionCTA.created_at,
      },
    };

    return NextResponse.json(ctaButtonWithMetadata, { status: 201 });
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
    const { section_cta_button_id, position } = body;

    if (!section_cta_button_id) {
      return NextResponse.json(
        { error: "section_cta_button_id is required" },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (position !== undefined) updateData.position = position;

    const { data: sectionCTA, error: sectionCTAError } = await ((supabase
      .from("section_cta_buttons") as any)
      .update(updateData)
      .eq("id", section_cta_button_id)
      .eq("section_id", id)
      .select(`
        *,
        cta_buttons (*)
      `)
      .single() as Promise<{ data: any; error: any }>);

    if (sectionCTAError) {
      return NextResponse.json({ error: sectionCTAError.message }, { status: 500 });
    }

    // Transform response
    const ctaButtonWithMetadata = {
      ...sectionCTA.cta_buttons,
      section_cta_button: {
        id: sectionCTA.id,
        section_id: sectionCTA.section_id,
        cta_button_id: sectionCTA.cta_button_id,
        position: sectionCTA.position,
        created_at: sectionCTA.created_at,
      },
    };

    return NextResponse.json(ctaButtonWithMetadata, { status: 200 });
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
    const sectionCTAButtonId = searchParams.get("section_cta_button_id");
    const ctaButtonId = searchParams.get("cta_button_id");

    if (!sectionCTAButtonId && !ctaButtonId) {
      return NextResponse.json(
        { error: "Either section_cta_button_id or cta_button_id is required" },
        { status: 400 }
      );
    }

    let query = supabase.from("section_cta_buttons").delete().eq("section_id", id);

    if (sectionCTAButtonId) {
      query = query.eq("id", sectionCTAButtonId);
    } else if (ctaButtonId) {
      query = query.eq("cta_button_id", ctaButtonId);
    }

    const { error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: "CTA button removed from section successfully" }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

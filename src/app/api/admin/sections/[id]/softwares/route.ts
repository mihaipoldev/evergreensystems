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

    // Use service role client to bypass RLS for admin operations
    const adminSupabase = createServiceRoleClient();

    const { id: sectionId } = await params;

    const { data, error } = await adminSupabase
      .from("section_softwares")
      .select(`
        *,
        softwares (*)
      `)
      .eq("section_id", sectionId)
      .order("order", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const softwares = (data || [])
      .filter((item: any) => item.softwares !== null)
      .map((item: any) => ({
        ...item.softwares,
        section_software: {
          id: item.id,
          order: item.order,
          icon_override: item.icon_override,
          status: item.status || "draft",
          created_at: item.created_at,
        },
      }));

    return NextResponse.json(softwares, { status: 200 });
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

    // Use service role client to bypass RLS for admin operations
    const adminSupabase = createServiceRoleClient();

    const { id: sectionId } = await params;
    const body = await request.json();
    const { software_id, order, icon_override, status } = body;

    if (!software_id) {
      return NextResponse.json(
        { error: "software_id is required" },
        { status: 400 }
      );
    }

    // Check if software is already connected to this section
    const { data: existing } = await adminSupabase
      .from("section_softwares")
      .select("id")
      .eq("section_id", sectionId)
      .eq("software_id", software_id)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: "Software is already connected to this section" },
        { status: 400 }
      );
    }

    // Get current max order for this section
    let newOrder = order;
    if (newOrder === undefined || newOrder === null) {
      const { data: existingOrder } = await (adminSupabase
        .from("section_softwares") as any)
        .select("order")
        .eq("section_id", sectionId)
        .order("order", { ascending: false })
        .limit(1)
        .maybeSingle();

      newOrder = existingOrder?.order !== undefined ? existingOrder.order + 1 : 0;
    }

    const { data, error } = await (adminSupabase
      .from("section_softwares") as any)
      .insert({
        section_id: sectionId,
        software_id,
        order: newOrder,
        icon_override: icon_override || null,
        status: status || "draft",
      })
      .select(`
        *,
        softwares (*)
      `)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Transform response
    const softwareWithSection = data && (data as any).softwares ? {
      ...(data as any).softwares,
      section_software: {
        id: (data as any).id,
        order: (data as any).order,
        icon_override: (data as any).icon_override,
        status: (data as any).status || "draft",
        created_at: (data as any).created_at,
      },
    } : null;

    revalidateTag("softwares", "max");
    revalidateTag("sections", "max");

    return NextResponse.json(softwareWithSection, { status: 201 });
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

    // Use service role client to bypass RLS for admin operations
    const adminSupabase = createServiceRoleClient();

    const { id: sectionId } = await params;
    const body = await request.json();
    const { section_software_id, order, icon_override, status } = body;

    if (!section_software_id) {
      return NextResponse.json(
        { error: "section_software_id is required" },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (order !== undefined) updateData.order = order;
    if (icon_override !== undefined) updateData.icon_override = icon_override || null;
    if (status !== undefined && ["published", "draft", "deactivated"].includes(status)) {
      updateData.status = status;
    }

    const { data: sectionSoftware, error: sectionSoftwareError } = await ((adminSupabase
      .from("section_softwares") as any)
      .update(updateData)
      .eq("id", section_software_id)
      .eq("section_id", sectionId)
      .select(`
        *,
        softwares (*)
      `)
      .single() as Promise<{ data: any; error: any }>);

    if (sectionSoftwareError) {
      return NextResponse.json({ error: sectionSoftwareError.message }, { status: 500 });
    }

    // Transform response
    const softwareWithSection = {
      ...sectionSoftware.softwares,
      section_software: {
        id: sectionSoftware.id,
        order: sectionSoftware.order,
        icon_override: sectionSoftware.icon_override,
        status: sectionSoftware.status || "draft",
        created_at: sectionSoftware.created_at,
      },
    };

    revalidateTag("softwares", "max");
    revalidateTag("sections", "max");

    return NextResponse.json(softwareWithSection, { status: 200 });
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

    // Use service role client to bypass RLS for admin operations
    const adminSupabase = createServiceRoleClient();

    const { id: sectionId } = await params;
    const { searchParams } = new URL(request.url);
    const sectionSoftwareId = searchParams.get("section_software_id");

    if (!sectionSoftwareId) {
      return NextResponse.json(
        { error: "section_software_id is required" },
        { status: 400 }
      );
    }

    const { error } = await adminSupabase
      .from("section_softwares")
      .delete()
      .eq("id", sectionSoftwareId)
      .eq("section_id", sectionId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
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

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
      .from("section_socials")
      .select(`
        *,
        social_platforms (*)
      `)
      .eq("section_id", sectionId)
      .order("order", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const platforms = (data || [])
      .filter((item: any) => item.social_platforms !== null)
      .map((item: any) => ({
        ...item.social_platforms,
        section_social: {
          id: item.id,
          order: item.order,
          status: item.status || "draft",
          created_at: item.created_at,
        },
      }));

    return NextResponse.json(platforms, { status: 200 });
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
    const { platform_id, order, status } = body;

    if (!platform_id) {
      return NextResponse.json(
        { error: "platform_id is required" },
        { status: 400 }
      );
    }

    // Check if platform is already connected to this section
    const { data: existing } = await adminSupabase
      .from("section_socials")
      .select("id")
      .eq("section_id", sectionId)
      .eq("platform_id", platform_id)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: "Social platform is already connected to this section" },
        { status: 400 }
      );
    }

    // Get current max order for this section
    let newOrder = order;
    if (newOrder === undefined || newOrder === null) {
      const { data: existingOrder } = await (adminSupabase
        .from("section_socials") as any)
        .select("order")
        .eq("section_id", sectionId)
        .order("order", { ascending: false })
        .limit(1)
        .maybeSingle();

      newOrder = existingOrder?.order !== undefined ? existingOrder.order + 1 : 0;
    }

    const { data, error } = await (adminSupabase
      .from("section_socials") as any)
      .insert({
        section_id: sectionId,
        platform_id,
        order: newOrder,
        status: status || "draft",
      })
      .select(`
        *,
        social_platforms (*)
      `)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Transform response
    const platformWithSection = data && (data as any).social_platforms ? {
      ...(data as any).social_platforms,
      section_social: {
        id: (data as any).id,
        order: (data as any).order,
        status: (data as any).status || "draft",
        created_at: (data as any).created_at,
      },
    } : null;

    revalidateTag("social-platforms", "max");
    revalidateTag("sections", "max");

    return NextResponse.json(platformWithSection, { status: 201 });
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
    const { section_social_id, order, status } = body;

    if (!section_social_id) {
      return NextResponse.json(
        { error: "section_social_id is required" },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (order !== undefined) updateData.order = order;
    if (status !== undefined && ["published", "draft", "deactivated"].includes(status)) {
      updateData.status = status;
    }

    const { data: sectionSocial, error: sectionSocialError } = await ((adminSupabase
      .from("section_socials") as any)
      .update(updateData)
      .eq("id", section_social_id)
      .eq("section_id", sectionId)
      .select(`
        *,
        social_platforms (*)
      `)
      .single() as Promise<{ data: any; error: any }>);

    if (sectionSocialError) {
      return NextResponse.json({ error: sectionSocialError.message }, { status: 500 });
    }

    // Transform response
    const platformWithSection = {
      ...sectionSocial.social_platforms,
      section_social: {
        id: sectionSocial.id,
        order: sectionSocial.order,
        status: sectionSocial.status || "draft",
        created_at: sectionSocial.created_at,
      },
    };

    revalidateTag("social-platforms", "max");
    revalidateTag("sections", "max");

    return NextResponse.json(platformWithSection, { status: 200 });
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
    const sectionSocialId = searchParams.get("section_social_id");

    if (!sectionSocialId) {
      return NextResponse.json(
        { error: "section_social_id is required" },
        { status: 400 }
      );
    }

    const { error } = await adminSupabase
      .from("section_socials")
      .delete()
      .eq("id", sectionSocialId)
      .eq("section_id", sectionId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    revalidateTag("social-platforms", "max");
    revalidateTag("sections", "max");

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

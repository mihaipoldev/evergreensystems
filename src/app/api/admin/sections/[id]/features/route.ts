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
      .from("section_features")
      .select(`
        *,
        offer_features (*)
      `)
      .eq("section_id", sectionId)
      .order("position", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const features = (data || [])
      .filter((item: any) => item.offer_features !== null)
      .map((item: any) => ({
        ...item.offer_features,
        section_feature: {
          id: item.id,
          position: item.position,
          status: item.status || "draft",
          created_at: item.created_at,
        },
      }));

    return NextResponse.json(features, { status: 200 });
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
    const { feature_id, position } = body;

    if (!feature_id) {
      return NextResponse.json(
        { error: "feature_id is required" },
        { status: 400 }
      );
    }

    // Check if feature is already connected to this section
    const { data: existing } = await adminSupabase
      .from("section_features")
      .select("id")
      .eq("section_id", sectionId)
      .eq("feature_id", feature_id)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: "Feature is already connected to this section" },
        { status: 400 }
      );
    }

    const { data, error } = await (adminSupabase
      .from("section_features") as any)
      .insert({
        section_id: sectionId,
        feature_id,
        position: position ?? 0,
        status: "draft",
      })
      .select(`
        *,
        offer_features (*)
      `)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Transform response
    const featureWithSection = data && (data as any).offer_features ? {
      ...(data as any).offer_features,
      section_feature: {
        id: (data as any).id,
        position: (data as any).position,
        status: (data as any).status || "draft",
        created_at: (data as any).created_at,
      },
    } : null;

    revalidateTag("offer-features", "max");
    revalidateTag("sections", "max");

    return NextResponse.json(featureWithSection, { status: 201 });
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
    const sectionFeatureId = searchParams.get("section_feature_id");

    if (!sectionFeatureId) {
      return NextResponse.json(
        { error: "section_feature_id is required" },
        { status: 400 }
      );
    }

    const { error } = await adminSupabase
      .from("section_features")
      .delete()
      .eq("id", sectionFeatureId)
      .eq("section_id", sectionId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    revalidateTag("offer-features", "max");
    revalidateTag("sections", "max");

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

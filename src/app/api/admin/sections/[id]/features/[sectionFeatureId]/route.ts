import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; sectionFeatureId: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Use service role client to bypass RLS for admin operations
    const adminSupabase = createServiceRoleClient();

    const { id: sectionId, sectionFeatureId } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status || !["published", "draft", "deactivated"].includes(status)) {
      return NextResponse.json(
        { error: "status must be one of: published, draft, deactivated" },
        { status: 400 }
      );
    }

    const { data, error } = await (adminSupabase
      .from("section_features") as any)
      .update({ status })
      .eq("id", sectionFeatureId)
      .eq("section_id", sectionId)
      .select(`
        *,
        offer_features (*)
      `)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: "Section feature not found" }, { status: 404 });
    }

    // Transform response
    const featureWithMetadata = {
      ...(data as any).offer_features,
      section_feature: {
        id: (data as any).id,
        section_id: (data as any).section_id,
        feature_id: (data as any).feature_id,
        position: (data as any).position,
        status: (data as any).status,
        created_at: (data as any).created_at,
      },
    };

    revalidateTag("offer-features", "max");
    revalidateTag("sections", "max");

    return NextResponse.json(featureWithMetadata, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

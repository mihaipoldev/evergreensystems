import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

type SocialPlatform = {
  id: string;
  name: string;
  icon: string | null;
  base_url: string;
  created_at: string;
  updated_at: string;
};

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
    const { searchParams } = new URL(request.url);
    const sectionId = searchParams.get("section_id");

    // Use service role client to bypass RLS for admin operations
    const adminSupabase = createServiceRoleClient();

    // Fetch original social platform
    const { data: original, error: fetchError } = await adminSupabase
      .from("social_platforms")
      .select("*")
      .eq("id", id)
      .single<SocialPlatform>();

    if (fetchError || !original) {
      return NextResponse.json(
        { error: "Social platform not found" },
        { status: 404 }
      );
    }

    // Generate duplicate name with version number (V2, V3, etc.)
    // Extract base name (remove existing version if present)
    const baseName = original.name.replace(/\s+V\d+$/, '');
    
    // Find the next version number
    let version = 2;
    let duplicateName: string;
    while (true) {
      duplicateName = `${baseName} V${version}`;
      const { data: existing } = await adminSupabase
        .from("social_platforms")
        .select("id")
        .eq("name", duplicateName)
        .maybeSingle();
      
      if (!existing) break;
      version++;
    }

    // Create duplicate social platform
    const { data: duplicate, error: duplicateError } = await (adminSupabase
      .from("social_platforms") as any)
      .insert({
        name: duplicateName,
        icon: original.icon,
        base_url: original.base_url,
      })
      .select()
      .single();

    if (duplicateError) {
      return NextResponse.json(
        { error: duplicateError.message },
        { status: 500 }
      );
    }

    // If section_id is provided, create junction table entry
    if (sectionId) {
      // Get max order for this section
      const { data: maxOrderData } = await adminSupabase
        .from("section_socials")
        .select("order")
        .eq("section_id", sectionId)
        .order("order", { ascending: false })
        .limit(1)
        .maybeSingle<{ order: number }>();

      const newOrder = maxOrderData?.order ? maxOrderData.order + 1 : 0;

      const { error: junctionError } = await (adminSupabase
        .from("section_socials") as any)
        .insert({
          section_id: sectionId,
          platform_id: duplicate.id,
          order: newOrder,
          status: "draft",
        });

      if (junctionError) {
        console.error("Error creating section social platform connection:", junctionError);
        // Don't fail the request, just log the error
      }
    }

    // Invalidate cache
    revalidateTag("social-platforms", "max");

    return NextResponse.json(duplicate, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}

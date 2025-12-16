import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

type Software = {
  id: string;
  name: string;
  slug: string;
  website_url: string | null;
  icon: string | null;
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

    // Use service role client for admin operations
    const adminSupabase = createServiceRoleClient();

    // Fetch the original software
    const { data: original, error: fetchError } = await adminSupabase
      .from("softwares")
      .select("*")
      .eq("id", id)
      .single<Software>();

    if (fetchError || !original) {
      return NextResponse.json(
        { error: "Software not found" },
        { status: 404 }
      );
    }

    // Generate unique name (e.g., "Original (Copy)", "Original (Copy 2)")
    let newName = `${original.name} (Copy)`;
    let counter = 1;
    while (true) {
      const { data: existing } = await adminSupabase
        .from("softwares")
        .select("id")
        .eq("name", newName)
        .maybeSingle();

      if (!existing) break;
      counter++;
      newName = `${original.name} (Copy ${counter})`;
    }

    // Generate unique slug
    let newSlug = `${original.slug}-copy`;
    counter = 1;
    while (true) {
      const { data: existing } = await adminSupabase
        .from("softwares")
        .select("id")
        .eq("slug", newSlug)
        .maybeSingle();

      if (!existing) break;
      counter++;
      newSlug = `${original.slug}-copy-${counter}`;
    }

    // Insert the duplicated software
    const { data: duplicated, error: insertError } = await (adminSupabase
      .from("softwares") as any)
      .insert({
        name: newName,
        slug: newSlug,
        website_url: original.website_url,
        icon: original.icon,
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json(
        { error: insertError.message },
        { status: 500 }
      );
    }

    // If sectionId is provided, create the junction table entry
    if (sectionId) {
      // Get max order for the section
      const { data: sectionSoftwares } = await adminSupabase
        .from("section_softwares")
        .select("order")
        .eq("section_id", sectionId)
        .order("order", { ascending: false })
        .limit(1)
        .returns<{ order: number }[]>();

      const maxOrder = sectionSoftwares && sectionSoftwares.length > 0
        ? sectionSoftwares[0].order
        : -1;

      const { error: junctionError } = await (adminSupabase
        .from("section_softwares") as any)
        .insert({
          section_id: sectionId,
          software_id: duplicated.id,
          order: maxOrder + 1,
          status: "draft",
        });

      if (junctionError) {
        console.error("Error creating section_softwares entry:", junctionError);
        // Don't fail the entire operation if junction creation fails
      }
    }

    // Invalidate cache
    revalidateTag("softwares", "max");

    return NextResponse.json(duplicated, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

type Timeline = {
  id: string;
  title: string;
  subtitle: string | null;
  badge: string | null;
  icon: string | null;
  position: number;
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

    // Fetch original timeline
    const { data: original, error: fetchError } = await adminSupabase
      .from("timeline")
      .select("*")
      .eq("id", id)
      .single<Timeline>();

    if (fetchError || !original) {
      return NextResponse.json(
        { error: "Timeline not found" },
        { status: 404 }
      );
    }

    // Generate duplicate title with version number (V2, V3, etc.)
    // Extract base name (remove existing version if present)
    const baseName = original.title.replace(/\s+V\d+$/, '');
    
    // Find the next version number
    let version = 2;
    let duplicateTitle: string;
    while (true) {
      duplicateTitle = `${baseName} V${version}`;
      const { data: existing } = await adminSupabase
        .from("timeline")
        .select("id")
        .eq("title", duplicateTitle)
        .maybeSingle();
      
      if (!existing) break;
      version++;
    }

    // Get max position to place duplicate at end
    const { data: maxPositionData } = await adminSupabase
      .from("timeline")
      .select("position")
      .order("position", { ascending: false })
      .limit(1)
      .maybeSingle<{ position: number }>();

    const newPosition = maxPositionData?.position ? maxPositionData.position + 1 : 0;

    // Create duplicate timeline
    const { data: duplicate, error: duplicateError } = await (adminSupabase
      .from("timeline") as any)
      .insert({
        title: duplicateTitle,
        subtitle: original.subtitle,
        badge: original.badge,
        icon: original.icon,
        position: newPosition,
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
      // Get max position for this section
      const { data: maxSectionPositionData } = await adminSupabase
        .from("section_timeline")
        .select("position")
        .eq("section_id", sectionId)
        .order("position", { ascending: false })
        .limit(1)
        .maybeSingle<{ position: number }>();

      const newSectionPosition = maxSectionPositionData?.position
        ? maxSectionPositionData.position + 1
        : 0;

      const { error: junctionError } = await (adminSupabase
        .from("section_timeline") as any)
        .insert({
          section_id: sectionId,
          timeline_id: duplicate.id,
          position: newSectionPosition,
          status: "draft",
        });

      if (junctionError) {
        console.error("Error creating section timeline connection:", junctionError);
        // Don't fail the request, just log the error
      }
    }

    // Invalidate cache
    revalidateTag("timeline", "max");

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

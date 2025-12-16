import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import type { Database } from "@/lib/supabase/types";

type Testimonial = Database["public"]["Tables"]["testimonials"]["Row"];

/**
 * Normalize avatar URL to ensure it has a protocol
 */
function normalizeAvatarUrl(url: string | null | undefined): string | null {
  if (!url || url.trim() === "") return null;
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  if (url.includes("b-cdn.net") || url.includes("cdn")) {
    return `https://${url}`;
  }
  return url;
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
    const { searchParams } = new URL(request.url);
    const sectionId = searchParams.get("section_id");

    // Use service role client to bypass RLS for admin operations
    const adminSupabase = createServiceRoleClient();

    // Fetch original testimonial
    const { data: original, error: fetchError } = await adminSupabase
      .from("testimonials")
      .select("*")
      .eq("id", id)
      .single<Testimonial>();

    if (fetchError || !original) {
      return NextResponse.json(
        { error: "Testimonial not found" },
        { status: 404 }
      );
    }

    // Get max position to place duplicate at end
    const { data: maxPositionData } = await adminSupabase
      .from("testimonials")
      .select("position")
      .order("position", { ascending: false })
      .limit(1)
      .maybeSingle<{ position: number }>();

    const newPosition = maxPositionData?.position ? maxPositionData.position + 1 : 0;

    // Create duplicate testimonial (same content)
    const { data: duplicate, error: duplicateError } = await (adminSupabase
      .from("testimonials") as any)
      .insert({
        author_name: original.author_name,
        author_role: original.author_role,
        company_name: original.company_name,
        headline: original.headline,
        quote: original.quote,
        avatar_url: normalizeAvatarUrl(original.avatar_url),
        rating: original.rating,
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
        .from("section_testimonials")
        .select("position")
        .eq("section_id", sectionId)
        .order("position", { ascending: false })
        .limit(1)
        .maybeSingle<{ position: number }>();

      const newSectionPosition = maxSectionPositionData?.position
        ? maxSectionPositionData.position + 1
        : 0;

      const { error: junctionError } = await (adminSupabase
        .from("section_testimonials") as any)
        .insert({
          section_id: sectionId,
          testimonial_id: duplicate.id,
          position: newSectionPosition,
        });

      if (junctionError) {
        console.error("Error creating section testimonial connection:", junctionError);
        // Don't fail the request, just log the error
      }
    }

    // Invalidate cache
    revalidateTag("testimonials", "max");

    // Normalize avatar URL before returning
    const normalizedData = duplicate ? normalizeAvatarUrl(duplicate.avatar_url) : null;
    const responseData = duplicate ? { ...duplicate, avatar_url: normalizedData } : duplicate;

    return NextResponse.json(responseData, { status: 201 });
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

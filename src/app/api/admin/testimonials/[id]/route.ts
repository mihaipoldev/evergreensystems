import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * Normalize avatar URL to ensure it has a protocol
 * Returns null for empty strings, null, or undefined
 */
function normalizeAvatarUrl(url: string | null | undefined): string | null {
  if (!url || url.trim() === "") return null;
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  // If it looks like a CDN URL (contains .b-cdn.net or similar), add https://
  if (url.includes("b-cdn.net") || url.includes("cdn")) {
    return `https://${url}`;
  }
  return url;
}

/**
 * Normalize testimonial data to ensure avatar URLs have protocols
 */
function normalizeTestimonial(testimonial: any): any {
  return {
    ...testimonial,
    avatar_url: normalizeAvatarUrl(testimonial.avatar_url),
  };
}

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
    const { data, error } = await supabase
      .from("testimonials")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: "Testimonial not found" }, { status: 404 });
    }

    // Normalize avatar URL before returning
    const normalizedData = normalizeTestimonial(data);

    return NextResponse.json(normalizedData, { status: 200 });
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
    const { author_name, author_role, company_name, headline, quote, avatar_url, rating, approved, position } = body;

    // Get the current testimonial to check for avatar_url changes
    const { data: currentTestimonial } = await supabase
      .from("testimonials")
      .select("avatar_url")
      .eq("id", id)
      .single() as { data: { avatar_url: string | null } | null; error: any };

    const oldAvatarUrl = currentTestimonial?.avatar_url ? normalizeAvatarUrl(currentTestimonial.avatar_url) : null;
    const newAvatarUrl = avatar_url?.trim() || null;

    // If avatar is being removed or replaced, move old avatar to bin
    if (oldAvatarUrl && oldAvatarUrl !== newAvatarUrl && avatar_url !== undefined) {
      try {
        if (oldAvatarUrl && (oldAvatarUrl.includes("b-cdn.net") || oldAvatarUrl.includes("cdn"))) {
          // Extract the file path from the CDN URL
          const pullZoneUrl = process.env.BUNNY_PULL_ZONE_URL?.replace(/\/$/, "") || "";
          let filePath = oldAvatarUrl;
          
          // Remove protocol
          if (filePath.startsWith("https://")) {
            filePath = filePath.replace("https://", "");
          } else if (filePath.startsWith("http://")) {
            filePath = filePath.replace("http://", "");
          }
          
          // Remove pull zone URL (with or without protocol)
          const pullZoneNoProtocol = pullZoneUrl.replace(/^https?:\/\//, "");
          if (filePath.startsWith(pullZoneNoProtocol + "/")) {
            filePath = filePath.replace(pullZoneNoProtocol + "/", "");
          }
          
          // If we successfully extracted a valid path, move to bin
          if (filePath && filePath !== oldAvatarUrl && !filePath.startsWith("http") && filePath.includes("/")) {
            const { moveImageBetweenFolders } = await import("@/lib/bunny");
            const binPath = `bin/${filePath}`;
            // Pass the full URL to moveImageBetweenFolders
            await moveImageBetweenFolders(oldAvatarUrl, binPath);
          }
        }
      } catch (trashError) {
        // Log error but don't fail the update - file cleanup is secondary
        console.warn("Failed to move avatar to bin:", trashError);
      }
    }

    const updateData: Record<string, unknown> = {};
    if (author_name !== undefined) updateData.author_name = author_name;
    if (author_role !== undefined) updateData.author_role = author_role || null;
    if (company_name !== undefined) updateData.company_name = company_name || null;
    if (quote !== undefined) updateData.quote = quote || null;
    if (avatar_url !== undefined) updateData.avatar_url = newAvatarUrl;
    if (rating !== undefined) updateData.rating = rating ?? null;
    if (approved !== undefined) updateData.approved = approved;
    if (position !== undefined) updateData.position = position;
    
    // Try to include headline, but handle case where column might not exist
    if (headline !== undefined) {
      updateData.headline = headline || null;
    }

    const { data, error } = await (supabase
      .from("testimonials") as any)
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      // If error is about headline column not existing, retry without it
      if (error.message?.includes("headline") && headline !== undefined) {
        delete updateData.headline;
        const { data: retryData, error: retryError } = await (supabase
          .from("testimonials") as any)
          .update(updateData)
          .eq("id", id)
          .select()
          .single();
        
        if (retryError) {
          return NextResponse.json({ error: retryError.message }, { status: 500 });
        }
        
        // Normalize avatar URL before returning
        const result = retryData ? normalizeTestimonial(retryData) : retryData;
        return NextResponse.json(result, { status: 200 });
      }
      
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Normalize avatar URL before returning
    const result = data ? normalizeTestimonial(data) : data;
    return NextResponse.json(result, { status: 200 });
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
    
    // First, get the testimonial to retrieve the avatar_url
    const { data: testimonial, error: fetchError } = await supabase
      .from("testimonials")
      .select("avatar_url")
      .eq("id", id)
      .single() as { data: { avatar_url: string | null } | null; error: any };

    if (fetchError && fetchError.code !== "PGRST116") {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    // Move avatar to trash in Bunny CDN if it exists
    if (testimonial?.avatar_url) {
      try {
        const avatarUrl = normalizeAvatarUrl(testimonial.avatar_url);
        if (avatarUrl && (avatarUrl.includes("b-cdn.net") || avatarUrl.includes("cdn"))) {
          // Extract the file path from the CDN URL to determine trash path
          const pullZoneUrl = process.env.BUNNY_PULL_ZONE_URL?.replace(/\/$/, "") || "";
          let filePath = avatarUrl;
          
          // Remove protocol
          if (filePath.startsWith("https://")) {
            filePath = filePath.replace("https://", "");
          } else if (filePath.startsWith("http://")) {
            filePath = filePath.replace("http://", "");
          }
          
          // Remove pull zone URL (with or without protocol)
          const pullZoneNoProtocol = pullZoneUrl.replace(/^https?:\/\//, "");
          if (filePath.startsWith(pullZoneNoProtocol + "/")) {
            filePath = filePath.replace(pullZoneNoProtocol + "/", "");
          }
          
          // If we successfully extracted a valid path, move to trash/bin
          if (filePath && filePath !== avatarUrl && !filePath.startsWith("http") && filePath.includes("/")) {
            const { moveImageBetweenFolders } = await import("@/lib/bunny");
            const trashPath = `bin/${filePath}`;
            // Pass the full URL to moveImageBetweenFolders
            await moveImageBetweenFolders(avatarUrl, trashPath);
          }
        }
      } catch (trashError) {
        // Log error but don't fail the deletion - file cleanup is secondary
        console.warn("Failed to move avatar to trash:", trashError);
      }
    }

    // Delete the testimonial from Supabase
    const { error } = await supabase
      .from("testimonials")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Testimonial deleted successfully" }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

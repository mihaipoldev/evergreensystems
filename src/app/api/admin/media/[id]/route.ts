import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { Database } from "@/lib/supabase/types";

type MediaUpdate = Database["public"]["Tables"]["media"]["Update"];

/**
 * Auto-determine media type based on source_type and URL
 */
function determineMediaType(sourceType: string, url: string): "image" | "video" | "file" {
  // Video platforms are always videos
  if (sourceType === "wistia" || sourceType === "youtube" || sourceType === "vimeo") {
    return "video";
  }

  // Check URL extension
  const urlLower = url.toLowerCase();
  const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg", ".bmp"];
  const videoExtensions = [".mp4", ".webm", ".ogg", ".mov", ".avi", ".mkv", ".flv", ".wmv"];

  // Check if URL ends with image extension
  if (imageExtensions.some(ext => urlLower.endsWith(ext))) {
    return "image";
  }

  // Check if URL ends with video extension
  if (videoExtensions.some(ext => urlLower.endsWith(ext))) {
    return "video";
  }

  // For uploads, default to file if we can't determine
  if (sourceType === "upload") {
    return "file";
  }

  // For external URLs, default to file if we can't determine
  return "file";
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
      .from("media")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 });
    }

    return NextResponse.json(data, { status: 200 });
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
    const { source_type, url, embed_id, name, thumbnail_url, duration } = body;

    // Get current media to determine type if url or source_type changes
    const { data: currentMedia } = await supabase
      .from("media")
      .select("source_type, url, embed_id")
      .eq("id", id)
      .single() as { data: { source_type: string | null; url: string | null; embed_id: string | null } | null };

    const updateData: Partial<MediaUpdate> = {};
    if (source_type !== undefined) updateData.source_type = source_type;
    if (embed_id !== undefined) updateData.embed_id = embed_id;
    if (name !== undefined) updateData.name = name;
    if (duration !== undefined) updateData.duration = duration;

    // Handle url and thumbnail_url based on source_type
    const finalSourceType = source_type !== undefined ? source_type : currentMedia?.source_type;
    if (finalSourceType === "wistia") {
      // For Wistia, don't update url or thumbnail_url, use embed_id
      const finalEmbedId = embed_id !== undefined ? embed_id : currentMedia?.embed_id;
      if (finalEmbedId) {
        updateData.url = `wistia:${finalEmbedId}`;
        updateData.thumbnail_url = null;
      }
    } else {
      // For non-Wistia, update url and thumbnail_url normally
      if (url !== undefined) updateData.url = url;
      if (thumbnail_url !== undefined) updateData.thumbnail_url = thumbnail_url;
    }

    // Auto-determine type if url/embed_id or source_type is being updated
    const finalUrl = finalSourceType === "wistia" 
      ? (embed_id !== undefined ? embed_id : currentMedia?.embed_id || "")
      : (url !== undefined ? url : currentMedia?.url || "");
    if (finalSourceType && finalUrl) {
      updateData.type = determineMediaType(finalSourceType, finalUrl);
    }

    const query = (supabase
      .from("media") as any)
      .update(updateData)
      .eq("id", id)
      .select()
      .single();
    
    const { data, error } = await query as { data: Database["public"]["Tables"]["media"]["Row"] | null; error: any };

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 200 });
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
    
    // Use service role client to bypass RLS for admin operations
    const adminSupabase = createServiceRoleClient();
    
    // Delete the media item
    // Note: This will automatically cascade delete all entries in section_media
    // junction table due to ON DELETE CASCADE constraint in the database schema
    const { error } = await adminSupabase
      .from("media")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Media deleted successfully" }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

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

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("media")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data || [], { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { source_type, url, embed_id, name, thumbnail_url, duration } = body;

    if (!source_type) {
      return NextResponse.json(
        { error: "source_type is required" },
        { status: 400 }
      );
    }

    // For Wistia, embed_id is required instead of url
    if (source_type === "wistia" && !embed_id) {
      return NextResponse.json(
        { error: "embed_id is required for Wistia media" },
        { status: 400 }
      );
    }

    // For non-Wistia, url is required
    if (source_type !== "wistia" && !url) {
      return NextResponse.json(
        { error: "url is required" },
        { status: 400 }
      );
    }

    // Auto-determine type based on source_type and URL/embed_id
    const finalUrl = source_type === "wistia" ? (embed_id || "") : url;
    const type = determineMediaType(source_type, finalUrl);

    const { data: media, error: mediaError } = await ((supabase
      .from("media") as any)
      .insert({
        type,
        source_type,
        url: source_type === "wistia" ? `wistia:${embed_id}` : url,
        embed_id: embed_id || null,
        name: name || null,
        thumbnail_url: source_type === "wistia" ? null : (thumbnail_url || null),
        duration: duration || null,
      })
      .select()
      .single() as Promise<{ data: any; error: any }>);

    if (mediaError) {
      return NextResponse.json({ error: mediaError.message }, { status: 500 });
    }

    return NextResponse.json(media, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

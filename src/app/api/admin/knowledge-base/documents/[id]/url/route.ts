import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const runtime = 'nodejs';

/**
 * GET /api/admin/knowledge-base/documents/[id]/url
 * Returns the CDN URL for a document (for opening in new tab)
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authentication
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Get document from database
    type DocumentRecord = {
      id: string;
      storage_path: string | null;
      content: string | null;
    };

    const { data: document, error: docError } = await supabase
      .from("rag_documents")
      .select("id, storage_path, content")
      .eq("id", id)
      .is("deleted_at", null)
      .single();

    if (docError || !document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    const typedDocument = document as DocumentRecord;

    // If it's pasted text (no storage_path), return null (should use modal)
    if (!typedDocument.storage_path || typedDocument.storage_path.trim() === "") {
      return NextResponse.json(
        { url: null, isPastedText: true },
        { status: 200 }
      );
    }

    // For uploaded files, construct CDN URL
    const pullZoneUrl = process.env.BUNNY_PULL_ZONE_URL;
    if (!pullZoneUrl) {
      return NextResponse.json(
        { error: "BUNNY_PULL_ZONE_URL not configured" },
        { status: 500 }
      );
    }

    // Construct CDN URL
    let cleanPullZoneUrl = pullZoneUrl.replace(/\/$/, "");
    if (!cleanPullZoneUrl.startsWith("http://") && !cleanPullZoneUrl.startsWith("https://")) {
      cleanPullZoneUrl = `https://${cleanPullZoneUrl}`;
    }
    const cleanStoragePath = typedDocument.storage_path.replace(/^\//, "");
    const cdnUrl = `${cleanPullZoneUrl}/${cleanStoragePath}`;

    return NextResponse.json(
      { url: cdnUrl, isPastedText: false },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error getting document URL:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}


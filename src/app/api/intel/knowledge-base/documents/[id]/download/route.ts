import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes for large file downloads

/**
 * GET /api/intel/knowledge-base/documents/[id]/download
 * Downloads a document file from Bunny CDN
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
      title: string | null;
      storage_path: string | null;
      content: string | null;
      content_type: string | null;
    };

    // Use service role client to bypass RLS
    const adminSupabase = createServiceRoleClient();
    const { data: document, error: docError } = await (adminSupabase
      .from("rag_documents") as any)
      .select("id, title, storage_path, content, content_type")
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

    // If it's pasted text (no storage_path), return as markdown
    if (!typedDocument.storage_path || typedDocument.storage_path.trim() === "") {
      const content = typedDocument.content || "";
      let filename = `${typedDocument.title || "document"}.md`;
      
      // Sanitize filename to ASCII - replace non-ASCII characters and remove invalid characters
      filename = filename
        .replace(/[^\x00-\x7F]/g, "") // Remove non-ASCII characters
        .replace(/[<>:"/\\|?*]/g, "_") // Replace invalid filename characters
        .trim();
      
      // Fallback if filename becomes empty after sanitization
      if (!filename || filename === ".md") {
        filename = "document.md";
      }
      
      // Convert content to Buffer with UTF-8 encoding to handle Unicode characters
      const buffer = Buffer.from(content, "utf-8");
      
      return new NextResponse(buffer, {
        status: 200,
        headers: {
          "Content-Type": "text/markdown; charset=utf-8",
          "Content-Disposition": `attachment; filename="${filename}"`,
          "Content-Length": buffer.length.toString(),
        },
      });
    }

    // For uploaded files, fetch from Bunny CDN
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

    // Fetch file from CDN
    const response = await fetch(cdnUrl);
    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch file from CDN: ${response.statusText}` },
        { status: response.status }
      );
    }

    // Get file content
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Get filename from title or storage_path
    let filename = typedDocument.title || "document";
    if (!filename.includes(".")) {
      const extension = typedDocument.storage_path.split(".").pop();
      if (extension && extension.length <= 5) {
        filename = `${filename}.${extension}`;
      }
    }

    // Sanitize filename to ASCII - replace non-ASCII characters and remove invalid characters
    filename = filename
      .replace(/[^\x00-\x7F]/g, "") // Remove non-ASCII characters
      .replace(/[<>:"/\\|?*]/g, "_") // Replace invalid filename characters
      .trim();
    
    // Fallback if filename becomes empty after sanitization
    if (!filename || filename === ".") {
      filename = "document";
      const extension = typedDocument.storage_path.split(".").pop();
      if (extension && extension.length <= 5) {
        filename = `${filename}.${extension}`;
      }
    }

    // Get content type
    const contentType = typedDocument.content_type || response.headers.get("content-type") || "application/octet-stream";

    // Return file with proper headers
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": buffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Error downloading document:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}


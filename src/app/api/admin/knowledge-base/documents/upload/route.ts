import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { uploadToBunny, deleteFromBunny } from "@/lib/bunny";

export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes for large file uploads

/**
 * Sanitize filename by removing invalid characters
 */
function sanitizeFilename(filename: string): string {
  // Remove path separators and other dangerous characters
  return filename
    .replace(/[\/\\?%*:|"<>]/g, '_')
    .replace(/\s+/g, '_')
    .replace(/^\.+|\.+$/g, ''); // Remove leading/trailing dots
}

/**
 * Extract the clean title from filename (without timestamp prefix)
 */
function extractTitleFromFilename(filename: string): string {
  // Remove timestamp prefix if present (format: {timestamp}-{filename})
  const timestampPattern = /^\d+-/;
  return filename.replace(timestampPattern, '');
}

export async function POST(request: Request) {
  let uploadedStoragePath: string | null = null;

  try {
    // Step A: Authentication
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get webhook URL from environment
    const webhookUrl = process.env.N8N_RAG_UPLOAD_DOCUMENT_WEBHOOK_URL;
    
    if (!webhookUrl) {
      return NextResponse.json(
        { error: "N8N_RAG_UPLOAD_DOCUMENT_WEBHOOK_URL is not configured" },
        { status: 500 }
      );
    }

    // Parse request - could be FormData (file upload) or JSON (text content)
    const contentType = request.headers.get("content-type") || "";
    const isFileUpload = contentType.includes("multipart/form-data");

    let knowledgeBaseId: string;
    let file: File | null = null;
    let textContent: string | null = null;
    let fileMetadata: {
      originalFilename: string;
      mimeType: string;
      size: number;
    } | null = null;

    if (isFileUpload) {
      // File upload - parse FormData
      const formData = await request.formData();
      knowledgeBaseId = formData.get("knowledge_base_id") as string;
      file = formData.get("file") as File | null;

      if (!knowledgeBaseId) {
        return NextResponse.json(
          { error: "knowledge_base_id is required" },
          { status: 400 }
        );
      }

      if (!file) {
        return NextResponse.json(
          { error: "file is required" },
          { status: 400 }
        );
      }

      fileMetadata = {
        originalFilename: file.name,
        mimeType: file.type || "application/octet-stream",
        size: file.size,
      };
    } else {
      // Text content - parse JSON
      const jsonBody = await request.json();
      knowledgeBaseId = jsonBody.knowledge_base_id;
      textContent = jsonBody.text_content || null;

      if (!knowledgeBaseId) {
        return NextResponse.json(
          { error: "knowledge_base_id is required" },
          { status: 400 }
        );
      }

      if (!textContent) {
        return NextResponse.json(
          { error: "text_content is required for text uploads" },
          { status: 400 }
        );
      }
    }

    // Step B: File Upload to Bunny (if file exists)
    let storagePath: string | null = null;
    let cleanTitle: string | null = null;
    let fileBuffer: Buffer | null = null;

    if (file && fileMetadata) {
      // Sanitize filename
      const sanitizedFilename = sanitizeFilename(fileMetadata.originalFilename);
      const timestamp = Date.now();
      const uniqueFilename = `${timestamp}-${sanitizedFilename}`;
      
      // Construct storage path
      storagePath = `knowledge-bases/${knowledgeBaseId}/${uniqueFilename}`.replace(/\/+/g, "/");
      
      // Extract clean title (without timestamp)
      cleanTitle = extractTitleFromFilename(sanitizedFilename);

      // Convert file to buffer (read once, reuse for n8n)
      const arrayBuffer = await file.arrayBuffer();
      fileBuffer = Buffer.from(arrayBuffer);

      // Upload to Bunny
      try {
        await uploadToBunny(fileBuffer, storagePath);
        uploadedStoragePath = storagePath; // Track for cleanup if needed
      } catch (error) {
        console.error("Bunny upload error:", error);
        return NextResponse.json(
          { error: `Failed to upload file to storage: ${error instanceof Error ? error.message : "Unknown error"}` },
          { status: 500 }
        );
      }
    }

    // Step C: Database Record Creation
    const adminSupabase = createServiceRoleClient();

    // Prepare metadata
    const metadata: Record<string, any> = {};
    if (fileMetadata) {
      metadata.size = fileMetadata.size;
      metadata.original_filename = fileMetadata.originalFilename;
      metadata.file_type = fileMetadata.mimeType;
    }

    // Prepare document insert data
    const documentData: Record<string, any> = {
      knowledge_base_id: knowledgeBaseId,
      title: cleanTitle,
      storage_path: storagePath,
      source_type: "upload",
      status: "processing",
      content: null,
      content_hash: null,
      content_type: fileMetadata?.mimeType || "text/markdown",
      metadata: metadata,
      chunk_count: 0,
      embedding_count: 0,
    };

    let documentRecord: any;
    try {
      const { data, error } = await (adminSupabase
        .from("rag_documents") as any)
        .insert(documentData)
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error("Failed to create document record");
      }

      documentRecord = data;
    } catch (error) {
      console.error("Database insert error:", error);
      
      // Cleanup: attempt to delete uploaded file from Bunny if it was uploaded
      if (uploadedStoragePath) {
        try {
          await deleteFromBunny(uploadedStoragePath);
        } catch (cleanupError) {
          console.error("Failed to cleanup Bunny file after DB error:", cleanupError);
          // Don't fail the response, just log
        }
      }

      return NextResponse.json(
        { error: `Failed to create document record: ${error instanceof Error ? error.message : "Unknown error"}` },
        { status: 500 }
      );
    }

    // Step D: Trigger n8n Webhook (fire-and-forget)
    try {
      const n8nFormData = new FormData();
      n8nFormData.append("document_id", documentRecord.id);
      n8nFormData.append("knowledge_base_id", knowledgeBaseId);
      
      if (file && fileBuffer && fileMetadata) {
        // Reuse the buffer we already read for Bunny upload
        // Create a Blob from the buffer for FormData
        // Convert Buffer to Uint8Array for Blob compatibility
        const blob = new Blob([new Uint8Array(fileBuffer)], { type: fileMetadata.mimeType });
        n8nFormData.append("file", blob, fileMetadata.originalFilename);
      } else if (textContent) {
        n8nFormData.append("text_content", textContent);
      }
      
      if (fileMetadata?.mimeType) {
        n8nFormData.append("content_type", fileMetadata.mimeType);
      }

      // Fire-and-forget: don't await or block on n8n response
      fetch(webhookUrl, {
        method: "POST",
        body: n8nFormData,
      }).catch((error) => {
        console.error("Failed to trigger n8n webhook (non-blocking):", error);
        // Don't fail the request, n8n can retry later via webhook retry mechanism
      });
    } catch (error) {
      console.error("Error preparing n8n webhook call (non-blocking):", error);
      // Continue anyway - document is created, n8n can process later
    }

    // Step E: Response - return document record immediately
    return NextResponse.json(
      { success: true, document: documentRecord },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error uploading document:", error);

    // Cleanup: attempt to delete uploaded file if it exists
    if (uploadedStoragePath) {
      try {
        await deleteFromBunny(uploadedStoragePath);
      } catch (cleanupError) {
        console.error("Failed to cleanup Bunny file after error:", cleanupError);
      }
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to upload document" },
      { status: 500 }
    );
  }
}

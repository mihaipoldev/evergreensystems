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

    // Parse request - could be FormData (file upload) or JSON (text content)
    const contentType = request.headers.get("content-type") || "";
    const isFileUpload = contentType.includes("multipart/form-data");

    let knowledgeBaseId: string;
    let file: File | null = null;
    let textContent: string | null = null;
    let sourceType: string = "upload";
    let documentContentType: string | null = null;
    let fileMetadata: {
      originalFilename: string;
      mimeType: string;
      size: number;
    } | null = null;

    let shouldChunk: boolean = true; // Default to true

    if (isFileUpload) {
      // File upload - parse FormData
      const formData = await request.formData();
      knowledgeBaseId = formData.get("knowledge_base_id") as string;
      file = formData.get("file") as File | null;
      sourceType = (formData.get("source_type") as string) || "upload";
      const shouldChunkStr = formData.get("should_chunk") as string | null;
      if (shouldChunkStr !== null) {
        shouldChunk = shouldChunkStr === "true";
      }

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
      sourceType = jsonBody.source_type || "text";
      documentContentType = jsonBody.content_type || "text/markdown"; // Default to markdown for text content

      if (jsonBody.should_chunk !== undefined && jsonBody.should_chunk !== null) {
        shouldChunk = jsonBody.should_chunk === true || jsonBody.should_chunk === "true";
      }

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

    // Step B: File Upload to Bunny (only for file uploads, NOT for text content)
    let storagePath: string | null = null;
    let cleanTitle: string | null = null;
    let fileBuffer: Buffer | null = null;

    console.log("[DEBUG] Step B: File Upload Check", {
      hasFile: !!file,
      hasFileMetadata: !!fileMetadata,
      hasTextContent: !!textContent,
      fileMetadata,
      isFileUpload,
      sourceType,
    });

    if (file && fileMetadata) {
      // File upload - upload to Bunny
      console.log("[DEBUG] Starting file upload to Bunny", {
        originalFilename: fileMetadata.originalFilename,
        fileSize: fileMetadata.size,
        mimeType: fileMetadata.mimeType,
        knowledgeBaseId,
      });

      // Sanitize filename
      const sanitizedFilename = sanitizeFilename(fileMetadata.originalFilename);
      const timestamp = Date.now();
      const uniqueFilename = `${timestamp}-${sanitizedFilename}`;
      
      // Construct storage path
      storagePath = `knowledge-bases/${knowledgeBaseId}/${uniqueFilename}`.replace(/\/+/g, "/");
      
      console.log("[DEBUG] File path prepared", {
        sanitizedFilename,
        uniqueFilename,
        storagePath,
      });

      // Extract clean title (without timestamp)
      cleanTitle = extractTitleFromFilename(sanitizedFilename);

      // Convert file to buffer (read once, reuse for n8n)
      console.log("[DEBUG] Converting file to buffer...");
      const arrayBuffer = await file.arrayBuffer();
      fileBuffer = Buffer.from(arrayBuffer);
      console.log("[DEBUG] File converted to buffer", { bufferSize: fileBuffer.length });

      // Upload to Bunny
      try {
        console.log("[DEBUG] Uploading to Bunny CDN...", { storagePath, bufferSize: fileBuffer.length });
        await uploadToBunny(fileBuffer, storagePath);
        uploadedStoragePath = storagePath; // Track for cleanup if needed
        console.log("[DEBUG] ✅ File successfully uploaded to Bunny", { storagePath });
      } catch (error) {
        console.error("[DEBUG] ❌ Bunny upload error:", error);
        return NextResponse.json(
          { error: `Failed to upload file to storage: ${error instanceof Error ? error.message : "Unknown error"}` },
          { status: 500 }
        );
      }
    } else if (textContent && !file) {
      // Text content - store directly in content field, NO Bunny upload
      console.log("[DEBUG] Text content detected - storing directly in database (no Bunny upload)", {
        textContentLength: textContent.length,
        knowledgeBaseId,
        contentType: documentContentType,
      });

      // Set clean title for text content (extract from first line or use default)
      cleanTitle = textContent.split("\n")[0].slice(0, 100) || "Text Document";
      console.log("[DEBUG] Text title extracted", { cleanTitle });
      
      // No storage_path for text content - it's stored in content field
      storagePath = null;
    } else {
      console.log("[DEBUG] ⚠️ Skipping Bunny upload - no file, fileMetadata, or textContent", {
        hasFile: !!file,
        hasFileMetadata: !!fileMetadata,
        hasTextContent: !!textContent,
        isFileUpload,
      });
    }

    // Step C: Database Record Creation
    console.log("[DEBUG] Step C: Preparing database record...");
    const adminSupabase = createServiceRoleClient();

    // Helper function to get file type (extension) from filename
    function getFileType(filename: string): string {
      const extension = filename.split('.').pop()?.toLowerCase() || '';
      return extension || 'unknown';
    }

    // Prepare metadata
    const metadata: Record<string, any> = {};
    if (fileMetadata) {
      metadata.size = fileMetadata.size;
      metadata.original_filename = fileMetadata.originalFilename;
      metadata.file_type = fileMetadata.mimeType;
      console.log("[DEBUG] Metadata prepared", { metadata });
    }

    // Prepare document insert data
    const finalContentType = fileMetadata?.mimeType || documentContentType || "text/markdown";
    
    // Status logic:
    // - If should_chunk is true: status = "processing" (for n8n workflow)
    // - If should_chunk is false: status = "completed" (no processing needed, document is ready to use)
    const documentStatus = shouldChunk ? "processing" : "completed";
    
    // For text content, store directly in content field; for files, content is null (file is in Bunny)
    const documentContent = textContent && !file ? textContent : null;
    
    const documentData: Record<string, any> = {
      knowledge_base_id: knowledgeBaseId,
      title: cleanTitle,
      storage_path: storagePath, // null for text content, path for file uploads
      source_type: sourceType,
      status: documentStatus,
      content: documentContent, // text content goes here, null for file uploads
      content_hash: null,
      content_type: finalContentType,
      metadata: metadata,
      chunk_count: 0,
      should_chunk: shouldChunk,
    };

    // Add file_type, file_size, mime_type only for file uploads (not text content)
    if (file && fileMetadata) {
      documentData.file_type = getFileType(fileMetadata.originalFilename);
      documentData.file_size = fileMetadata.size;
      documentData.mime_type = fileMetadata.mimeType;
      console.log("[DEBUG] File-specific fields added", {
        file_type: documentData.file_type,
        file_size: documentData.file_size,
        mime_type: documentData.mime_type,
      });
    }

    console.log("[DEBUG] Document data prepared", {
      shouldChunk,
      storagePath,
      hasContent: !!documentContent,
      contentLength: documentContent?.length,
      status: documentStatus,
      sourceType,
    });

    console.log("[DEBUG] Document data prepared for insert", {
      documentData: {
        ...documentData,
        metadata: metadata,
      },
      shouldChunk,
      storagePath,
    });

    console.log("[DEBUG] Inserting document into database...");
    const { data: documentRecord, error: insertError } = await (adminSupabase
      .from("rag_documents") as any)
      .insert(documentData)
      .select()
      .single();

    if (insertError) {
      console.error("[DEBUG] ❌ Database insert error:", insertError);
      
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
        { error: `Failed to create document record: ${insertError.message || "Unknown error"}` },
        { status: 500 }
      );
    }

    if (!documentRecord) {
      console.error("[DEBUG] ❌ No document record returned from database");
      // Cleanup: attempt to delete uploaded file from Bunny if it was uploaded
      if (uploadedStoragePath) {
        try {
          await deleteFromBunny(uploadedStoragePath);
        } catch (cleanupError) {
          console.error("[DEBUG] Failed to cleanup Bunny file after DB error:", cleanupError);
        }
      }

      return NextResponse.json(
        { error: "Failed to create document record: No data returned" },
        { status: 500 }
      );
    }

    console.log("[DEBUG] ✅ Document successfully created in database", {
      documentId: documentRecord.id,
      storagePath: documentRecord.storage_path,
      status: documentRecord.status,
      shouldChunk: documentRecord.should_chunk,
    });

    // Step D: Trigger n8n Webhook (only if should_chunk is true)
    if (shouldChunk) {
      const webhookUrl = process.env.N8N_RAG_UPLOAD_DOCUMENT_WEBHOOK_URL;
      
      if (webhookUrl) {
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
      } else {
        console.warn("N8N_RAG_UPLOAD_DOCUMENT_WEBHOOK_URL not configured, skipping webhook trigger");
      }
    } else {
      // should_chunk is false - file is uploaded to Bunny but no processing workflow is triggered
      console.log(`Document ${documentRecord.id} uploaded with should_chunk=false, skipping n8n workflow`);
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


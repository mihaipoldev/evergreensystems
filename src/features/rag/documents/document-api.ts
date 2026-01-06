"use client";

/**
 * Upload a document via server-side API route
 * Handles both file uploads (FormData) and text content (JSON)
 */
import type { RAGDocument } from "./document-types";

export async function uploadDocument(payload: {
  knowledge_base_id: string;
  title?: string | null;
  source_type: string;
  content_type?: string | null;
  source_url?: string | null;
  drive_file_id?: string | null;
  notion_page_id?: string | null;
  text_content?: string | null;
  file?: File | null;
  should_chunk?: boolean;
}): Promise<{ success: boolean; document?: RAGDocument; error?: string }> {
  console.log("[DEBUG] document-api: uploadDocument called", {
    hasFile: !!payload.file,
    sourceType: payload.source_type,
    knowledgeBaseId: payload.knowledge_base_id,
    shouldChunk: payload.should_chunk,
    fileSize: payload.file?.size,
    fileName: payload.file?.name,
  });

  try {
    let body: FormData | string;
    const headers: Record<string, string> = {};

    if (payload.file) {
      console.log("[DEBUG] document-api: Preparing FormData for file upload");
      // File upload - use FormData
      const formData = new FormData();
      formData.append("file", payload.file);
      formData.append("knowledge_base_id", payload.knowledge_base_id);
      if (payload.title) formData.append("title", payload.title);
      formData.append("source_type", payload.source_type);
      if (payload.content_type) formData.append("content_type", payload.content_type);
      if (payload.source_url) formData.append("source_url", payload.source_url);
      if (payload.drive_file_id) formData.append("drive_file_id", payload.drive_file_id);
      if (payload.notion_page_id) formData.append("notion_page_id", payload.notion_page_id);
      if (payload.should_chunk !== undefined) {
        formData.append("should_chunk", payload.should_chunk.toString());
      }
      
      console.log("[DEBUG] document-api: FormData prepared", {
        hasFile: formData.has("file"),
        knowledgeBaseId: formData.get("knowledge_base_id"),
        shouldChunk: formData.get("should_chunk"),
      });
      
      body = formData;
      // Don't set Content-Type header for FormData - browser will set it with boundary
    } else {
      console.log("[DEBUG] document-api: Preparing JSON for text/URL upload");
      // Text content - use JSON
      headers["Content-Type"] = "application/json";
      body = JSON.stringify({
        knowledge_base_id: payload.knowledge_base_id,
        title: payload.title || null,
        source_type: payload.source_type,
        content_type: payload.content_type || null,
        source_url: payload.source_url || null,
        drive_file_id: payload.drive_file_id || null,
        notion_page_id: payload.notion_page_id || null,
        text_content: payload.text_content || null,
        should_chunk: payload.should_chunk !== undefined ? payload.should_chunk : null,
      });
    }

    console.log("[DEBUG] document-api: Sending request to /api/intel/knowledge-base/documents/upload");
    const response = await fetch("/api/intel/knowledge-base/documents/upload", {
      method: "POST",
      headers,
      body,
    });

    console.log("[DEBUG] document-api: Response received", {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
      console.error("[DEBUG] document-api: ❌ Upload failed", {
        status: response.status,
        errorData,
      });
      return {
        success: false,
        error: errorData.error || `Upload failed: ${response.statusText}`,
      };
    }

    const responseData = await response.json();
    console.log("[DEBUG] document-api: ✅ Upload successful", {
      hasDocument: !!responseData.document,
      documentId: responseData.document?.id,
    });
    return { 
      success: true, 
      document: responseData.document as RAGDocument 
    };
  } catch (error: any) {
    console.error("[DEBUG] document-api: ❌ Exception during upload", error);
    return {
      success: false,
      error: error.message || "Failed to upload document",
    };
  }
}

/**
 * Get document URL for viewing
 * Returns URL for uploaded files, or indicates if it's pasted text
 */
export async function getDocumentUrl(
  documentId: string
): Promise<{ success: boolean; url?: string | null; isPastedText?: boolean; error?: string }> {
  try {
    const response = await fetch(`/api/intel/knowledge-base/documents/${documentId}/url`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.error || `Failed to get document URL: ${response.statusText}`,
      };
    }

    const data = await response.json();
    return {
      success: true,
      url: data.url || null,
      isPastedText: data.isPastedText || false,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to get document URL",
    };
  }
}

/**
 * Download a document file
 * For pasted text: returns as .md file
 * For uploaded files: returns the original file from CDN
 */
export async function downloadDocument(
  documentId: string,
  defaultTitle?: string | null
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`/api/intel/knowledge-base/documents/${documentId}/download`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Failed to download" }));
      return {
        success: false,
        error: errorData.error || `Failed to download: ${response.statusText}`,
      };
    }

    // Get filename from Content-Disposition header or use default
    const contentDisposition = response.headers.get("Content-Disposition");
    let filename = defaultTitle || "document";
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="?(.+?)"?$/);
      if (filenameMatch) {
        filename = filenameMatch[1];
      }
    }

    // Sanitize filename to ASCII - the download attribute doesn't support Unicode
    filename = filename
      .replace(/[^\x00-\x7F]/g, "") // Remove non-ASCII characters
      .replace(/[<>:"/\\|?*]/g, "_") // Replace invalid filename characters
      .trim();
    
    // Fallback if filename becomes empty after sanitization
    if (!filename) {
      filename = "document.md";
    }

    // Get file as blob
    const blob = await response.blob();

    // Create download link and trigger download
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement("a");
    a.href = url;
    a.download = filename;
    window.document.body.appendChild(a);
    a.click();
    window.document.body.removeChild(a);
    URL.revokeObjectURL(url);

    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to download document",
    };
  }
}

/**
 * Remove a document via server-side API route
 */
export async function removeDocument(payload: {
  knowledge_base_id: string;
  document_id: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch("/api/intel/knowledge-base/documents/remove", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        knowledge_base_id: payload.knowledge_base_id,
        document_id: payload.document_id,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        error: errorData.error || `Remove failed: ${response.statusText}`,
      };
    }

    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to remove document",
    };
  }
}

/**
 * Link documents to a project via server-side API route
 */
export async function linkDocumentsToProject(
  projectId: string,
  documentIds: string[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`/api/intel/projects/${projectId}/link-documents`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        document_ids: documentIds,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.error || `Link failed: ${response.statusText}`,
      };
    }

    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to link documents",
    };
  }
}


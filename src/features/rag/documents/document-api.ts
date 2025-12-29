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
}): Promise<{ success: boolean; document?: RAGDocument; error?: string }> {
  try {
    let body: FormData | string;
    let headers: Record<string, string> = {};

    if (payload.file) {
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
      
      body = formData;
      // Don't set Content-Type header for FormData - browser will set it with boundary
    } else {
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
      });
    }

    const response = await fetch("/api/admin/knowledge-base/documents/upload", {
      method: "POST",
      headers,
      body,
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        error: errorData.error || `Upload failed: ${response.statusText}`,
      };
    }

    const responseData = await response.json();
    return { 
      success: true, 
      document: responseData.document as RAGDocument 
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to upload document",
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
    const response = await fetch("/api/admin/knowledge-base/documents/remove", {
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


import { createServiceRoleClient } from "@/lib/supabase/server";
import type { RAGDocument } from "./document-types";

/**
 * Get all documents for a knowledge base, ordered by created_at descending
 * Uses service role client to bypass RLS for admin operations
 * Excludes soft-deleted documents (where deleted_at IS NULL)
 */
export async function getDocumentsByKnowledgeBaseId(knowledgeBaseId: string): Promise<RAGDocument[]> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("rag_documents")
    .select("*")
    .eq("knowledge_base_id", knowledgeBaseId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data || [];
}


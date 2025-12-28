import { createServiceRoleClient } from "@/lib/supabase/server";
import type { AIKnowledge } from "./types";
import type { RAGDocument } from "./document-types";
import { unstable_cache } from "next/cache";

export type AIKnowledgeWithCount = AIKnowledge & { document_count: number };

/**
 * Get all AI knowledge bases with document counts, ordered by created_at descending
 * Uses service role client to bypass RLS for admin operations
 * Cached for 1 minute to improve performance
 */
export async function getAllAIKnowledge(): Promise<AIKnowledgeWithCount[]> {
  return unstable_cache(
    async () => {
      const supabase = createServiceRoleClient();
      const { data, error } = await supabase
        .from("rag_knowledge_bases")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      const knowledgeBases = (data || []) as AIKnowledge[];
      
      // Get document counts for each knowledge base (excluding soft-deleted)
      const knowledgeBasesWithCounts = await Promise.all(
        knowledgeBases.map(async (kb) => {
          const { count, error: countError } = await supabase
            .from("rag_documents")
            .select("*", { count: "exact", head: true })
            .eq("knowledge_base_id", kb.id)
            .is("deleted_at", null);

          return {
            ...kb,
            document_count: countError ? 0 : (count || 0),
          };
        })
      );

      return knowledgeBasesWithCounts;
    },
    ['all-ai-knowledge'],
    {
      revalidate: 60,
      tags: ['ai-knowledge'],
    }
  )();
}

/**
 * Get a single AI knowledge base by id
 * Uses service role client to bypass RLS for admin operations
 */
export async function getAIKnowledgeById(id: string): Promise<AIKnowledge | null> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("rag_knowledge_bases")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    throw error;
  }

  return data;
}

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


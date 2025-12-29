import { createServiceRoleClient } from "@/lib/supabase/server";
import type { KnowledgeBase } from "./types";
import { unstable_cache } from "next/cache";

export type KnowledgeBaseWithCount = KnowledgeBase & { document_count: number };

/**
 * Get all knowledge bases with document counts, ordered by created_at descending
 * Uses service role client to bypass RLS for admin operations
 * Cached for 1 minute to improve performance
 */
export async function getAllKnowledgeBases(): Promise<KnowledgeBaseWithCount[]> {
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

      const knowledgeBases = (data || []) as KnowledgeBase[];
      
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
    ['all-knowledge-bases'],
    {
      revalidate: 60,
      tags: ['rag-knowledge-bases'],
    }
  )();
}

/**
 * Get a single knowledge base by id
 * Uses service role client to bypass RLS for admin operations
 */
export async function getKnowledgeBaseById(id: string): Promise<KnowledgeBase | null> {
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


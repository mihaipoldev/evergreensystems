import { createServiceRoleClient } from "@/lib/supabase/server";
import type { KnowledgeBase } from "./types";
import { unstable_cache } from "next/cache";

export type KnowledgeBaseWithCount = KnowledgeBase & { document_count: number };

/**
 * Get all knowledge bases with document counts, ordered by created_at descending
 * Uses service role client to bypass RLS for admin operations
 * Cached for 1 minute to improve performance
 * Optimized to use a single query instead of N+1 queries
 */
export async function getAllKnowledgeBases(): Promise<KnowledgeBaseWithCount[]> {
  return unstable_cache(
    async () => {
      const supabase = createServiceRoleClient();
      const { data: knowledgeBases, error } = await supabase
        .from("rag_knowledge_bases")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      if (!knowledgeBases || knowledgeBases.length === 0) {
        return [];
      }

      const kbArray = knowledgeBases as KnowledgeBase[];
      const kbIds = kbArray.map((kb) => kb.id);

      // Fetch document counts for all knowledge bases in a single query
      const { data: documentCounts, error: countError } = await supabase
        .from("rag_documents")
        .select("knowledge_base_id")
        .in("knowledge_base_id", kbIds)
        .is("deleted_at", null);

      if (countError) {
        throw countError;
      }

      // Create a map of knowledge_base_id -> count
      const countMap = new Map<string, number>();
      (documentCounts || []).forEach((doc: any) => {
        const kbId = doc.knowledge_base_id;
        countMap.set(kbId, (countMap.get(kbId) || 0) + 1);
      });

      // Combine knowledge bases with their document counts
      return kbArray.map((kb) => ({
        ...kb,
        document_count: countMap.get(kb.id) || 0,
      }));
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

/**
 * Knowledge base statistics
 */
export type KnowledgeBaseStats = {
  totalDocuments: number;
  totalChunks: number;
  totalRuns: number;
  processingDocuments: number;
  failedDocuments: number;
};

/**
 * Get statistics for a knowledge base by id
 * Uses optimized queries to fetch all stats efficiently
 * Uses service role client to bypass RLS for admin operations
 */
export async function getKnowledgeBaseStatsById(id: string): Promise<KnowledgeBaseStats> {
  const supabase = createServiceRoleClient();

  // Fetch all documents for this KB in a single query
  // We'll aggregate in code for flexibility
  const { data: documents, error: docsError } = await supabase
    .from("rag_documents")
    .select("status, chunk_count")
    .eq("knowledge_base_id", id)
    .is("deleted_at", null);

  if (docsError) {
    throw docsError;
  }

  const docs = (documents || []) as any[];
  const totalDocuments = docs.length;
  const totalChunks = docs.reduce((sum, doc: any) => sum + (doc.chunk_count || 0), 0);
  const processingDocuments = docs.filter((doc: any) => doc.status === "processing").length;
  const failedDocuments = docs.filter((doc: any) => doc.status === "failed").length;

  // Fetch runs count in a single optimized query
  const { count: runsCount, error: runsError } = await supabase
    .from("rag_runs")
    .select("*", { count: "exact", head: true })
    .eq("knowledge_base_id", id);

  if (runsError) {
    throw runsError;
  }

  return {
    totalDocuments,
    totalChunks,
    totalRuns: runsCount || 0,
    processingDocuments,
    failedDocuments,
  };
}


import { createServiceRoleClient } from "@/lib/supabase/server";
import type { ResearchSubject } from "./types";

/**
 * Get all research subjects, ordered by created_at descending
 * Uses service role client to bypass RLS for admin operations
 */
export async function getAllResearchSubjects(): Promise<ResearchSubject[]> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("research_subjects")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data || []) as ResearchSubject[];
}

/**
 * Get a single research subject by id
 * Uses service role client to bypass RLS for admin operations
 */
export async function getResearchSubjectById(id: string): Promise<ResearchSubject | null> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("research_subjects")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    throw error;
  }

  return data as ResearchSubject;
}


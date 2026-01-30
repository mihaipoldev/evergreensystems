import { createServiceRoleClient } from "@/lib/supabase/server";
import type { Workflow } from "./types";

/**
 * Get all workflows, ordered by created_at descending
 * Uses service role client to bypass RLS for admin operations
 */
export async function getAllWorkflows(): Promise<Workflow[]> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("workflows")
    .select("*")
    .eq("enabled", true)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data || []) as Workflow[];
}

/**
 * Get all workflows (including disabled ones)
 * Uses service role client to bypass RLS for admin operations
 */
export async function getAllWorkflowsIncludingDisabled(): Promise<Workflow[]> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("workflows")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data || []) as Workflow[];
}

/**
 * Get a single workflow by id
 * Uses service role client to bypass RLS for admin operations
 */
export async function getWorkflowById(id: string): Promise<Workflow | null> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("workflows")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    throw error;
  }

  return data as Workflow;
}

/**
 * Get a single workflow by slug
 * Uses service role client to bypass RLS for admin operations
 */
export async function getWorkflowBySlug(slug: string): Promise<Workflow | null> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("workflows")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    throw error;
  }

  return data as Workflow;
}


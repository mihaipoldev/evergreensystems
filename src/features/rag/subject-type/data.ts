import { createServiceRoleClient } from "@/lib/supabase/server";
import type { SubjectType } from "./types";
import type { Workflow } from "../workflows/types";

/**
 * Get all subject types, ordered by name
 * Uses service role client to bypass RLS for admin operations
 */
export async function getAllSubjectTypes(): Promise<SubjectType[]> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("subject_types")
    .select("*")
    .eq("enabled", true)
    .order("name", { ascending: true });

  if (error) {
    throw error;
  }

  return (data || []) as SubjectType[];
}

/**
 * Get all subject types including disabled ones
 * Uses service role client to bypass RLS for admin operations
 */
export async function getAllSubjectTypesIncludingDisabled(): Promise<SubjectType[]> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("subject_types")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    throw error;
  }

  return (data || []) as SubjectType[];
}

/**
 * Get workflows for a specific subject type using the junction table
 * Uses service role client to bypass RLS for admin operations
 */
export async function getWorkflowsBySubjectType(subjectTypeName: string): Promise<Workflow[]> {
  const supabase = createServiceRoleClient();
  
  const { data, error } = await supabase
    .from("workflow_subject_types")
    .select(`
      display_order,
      workflows (
        id,
        name,
        label,
        description,
        icon,
        estimated_cost,
        estimated_time_minutes,
        input_schema,
        enabled,
        created_at,
        updated_at
      )
    `)
    .eq("subject_type", subjectTypeName)
    .order("display_order", { ascending: true });

  if (error) {
    throw error;
  }

  // Extract workflows from the nested structure and filter enabled ones
  const workflows = (data || [])
    .filter((item: any) => item.workflows !== null && item.workflows.enabled === true)
    .map((item: any) => item.workflows);

  return workflows as Workflow[];
}


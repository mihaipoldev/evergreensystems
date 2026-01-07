import { createServiceRoleClient } from "@/lib/supabase/server";
import type { ProjectType } from "./types";
import type { Workflow } from "../workflows/types";

/**
 * Get all project types, ordered by name
 * Uses service role client to bypass RLS for admin operations
 */
export async function getAllProjectTypes(): Promise<ProjectType[]> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("project_types")
    .select("*")
    .eq("enabled", true)
    .order("name", { ascending: true });

  if (error) {
    throw error;
  }

  return (data || []) as ProjectType[];
}

/**
 * Get all project types including disabled ones
 * Uses service role client to bypass RLS for admin operations
 */
export async function getAllProjectTypesIncludingDisabled(): Promise<ProjectType[]> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("project_types")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    throw error;
  }

  return (data || []) as ProjectType[];
}

/**
 * Get workflows for a specific project type using the junction table (project_type_workflows)
 * Uses service role client to bypass RLS for admin operations
 */
export async function getWorkflowsByProjectType(projectTypeName: string): Promise<Workflow[]> {
  const supabase = createServiceRoleClient();
  
  // First, get the project_type_id by name
  const { data: projectType } = await supabase
    .from("project_types")
    .select("id")
    .eq("name", projectTypeName)
    .single();
  
  if (!projectType) {
    return [];
  }
  
  const typedProjectType = projectType as { id: string };
  const { data, error } = await supabase
    .from("project_type_workflows")
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
    .eq("project_type_id", typedProjectType.id)
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


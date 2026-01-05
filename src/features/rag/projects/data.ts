import { createServiceRoleClient } from "@/lib/supabase/server";
import type { Project, ProjectWithKB } from "./types";

/**
 * Get all projects, ordered by created_at descending
 * Uses service role client to bypass RLS for admin operations
 */
export async function getAllProjects(): Promise<Project[]> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .is("archived_at", null)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data || []) as Project[];
}

/**
 * Get all projects with document counts
 */
export async function getAllProjectsWithCounts(): Promise<(Project & { document_count: number })[]> {
  const projects = await getAllProjects();
  const supabase = createServiceRoleClient();

  const projectsWithCounts = await Promise.all(
    projects.map(async (project) => {
      // Count linked documents (from junction table - research documents)
      const { count: linkedCount } = await supabase
        .from("project_documents")
        .select("*", { count: "exact", head: true })
        .eq("project_id", project.id);

      // Count workspace documents (documents in project's workspace KB)
      const { count: workspaceCount } = await supabase
        .from("rag_documents")
        .select("*", { count: "exact", head: true })
        .eq("knowledge_base_id", project.kb_id)
        .is("deleted_at", null);

      return {
        ...project,
        document_count: (linkedCount || 0) + (workspaceCount || 0),
      };
    })
  );

  return projectsWithCounts;
}

/**
 * Get a single project by id
 * Uses service role client to bypass RLS for admin operations
 */
export async function getProjectById(id: string): Promise<Project | null> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    throw error;
  }

  return data as Project;
}

/**
 * Get a single project by id with linked KB info
 */
export async function getProjectByIdWithKB(id: string): Promise<ProjectWithKB | null> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("projects")
    .select(`
      *,
      rag_knowledge_bases (
        id,
        name,
        type
      )
    `)
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    throw error;
  }

  return data as ProjectWithKB;
}


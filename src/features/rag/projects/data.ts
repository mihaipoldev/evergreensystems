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
 * Optimized: Uses batch queries instead of O(n) individual queries
 */
export async function getAllProjectsWithCounts(): Promise<(Project & { document_count: number })[]> {
  const projects = await getAllProjects();
  
  if (projects.length === 0) {
    return [];
  }

  const supabase = createServiceRoleClient();
  const projectIds = projects.map(p => p.id);
  const kbIds = projects.map(p => p.kb_id).filter((id): id is string => Boolean(id));

  // Optimized: Batch fetch all document counts in parallel
  const [linkedCountsResult, workspaceCountsResult] = await Promise.all([
    // Get linked document counts for all projects at once
    // Index idx_project_documents_project_document is used here
    supabase
      .from("project_documents")
      .select("project_id")
      .in("project_id", projectIds),
    
    // Get workspace document counts for all KBs at once
    // Index idx_rag_documents_kb_deleted_created is used here
    kbIds.length > 0
      ? supabase
          .from("rag_documents")
          .select("knowledge_base_id")
          .in("knowledge_base_id", kbIds)
          .is("deleted_at", null)
      : Promise.resolve({ data: [], error: null })
  ]);

  // Process linked document counts
  const linkedCountsByProject = new Map<string, number>();
  if (linkedCountsResult.data) {
    for (const item of linkedCountsResult.data) {
      const projectId = (item as any).project_id;
      if (projectId) {
        linkedCountsByProject.set(projectId, (linkedCountsByProject.get(projectId) || 0) + 1);
      }
    }
  }

  // Process workspace document counts
  const workspaceCountsByKB = new Map<string, number>();
  if (workspaceCountsResult.data) {
    for (const item of workspaceCountsResult.data) {
      const kbId = (item as any).knowledge_base_id;
      if (kbId) {
        workspaceCountsByKB.set(kbId, (workspaceCountsByKB.get(kbId) || 0) + 1);
      }
    }
  }

  // Combine counts for each project
  return projects.map((project) => {
    const linkedCount = linkedCountsByProject.get(project.id) || 0;
    const workspaceCount = project.kb_id ? (workspaceCountsByKB.get(project.kb_id) || 0) : 0;
    
    return {
      ...project,
      document_count: linkedCount + workspaceCount,
    };
  });
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


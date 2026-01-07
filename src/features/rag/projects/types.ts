export type Project = {
  id: string;
  name: string;
  client_name?: string | null; // Kept for backward compatibility
  status: 'active' | 'onboarding' | 'delivered' | 'archived';
  type: 'niche_research' | 'client' | 'internal';
  project_type_id: string | null;
  kb_id: string; // Required - links to workspace KB
  description: string | null;
  metadata: Record<string, any>;
  // Niche research fields (nullable, only populated for niche research projects)
  geography?: string | null;
  category?: string | null;
  first_researched_at?: string | null;
  last_researched_at?: string | null;
  run_count?: number;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  archived_at: string | null;
};

export type ProjectWithKB = Project & {
  rag_knowledge_bases: {
    id: string;
    name: string;
    type: string | null;
  } | null;
};


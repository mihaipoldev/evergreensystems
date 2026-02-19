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
  total_usage?: number;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  archived_at: string | null;
  // Run statistics (only populated for niche projects when requested)
  runs_count?: {
    completed: number;
    processed: number; // includes completed + in-progress
    failed: number;
  };
  // Niche Intelligence verdict and fit score (only populated for niche projects when requested)
  niche_intelligence_verdict?: "pursue" | "test" | "caution" | "avoid" | null;
  niche_intelligence_fit_score?: number | null;
  niche_intelligence_updated_at?: string | null;
  niche_intelligence_runs?: Array<{
    id: string;
    verdict: "pursue" | "test" | "caution" | "avoid" | null;
    fit_score: number | null;
    updated_at: string | null;
    status: "complete" | "queued" | "collecting" | "ingesting" | "generating" | "processing" | "failed";
  }> | null;
};

export type ProjectWithKB = Project & {
  rag_knowledge_bases: {
    id: string;
    name: string;
    type: string | null;
  } | null;
};


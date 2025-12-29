export type RunType = "niche_intelligence" | "kb_query" | "doc_ingest";

export type RunStatus = "queued" | "collecting" | "ingesting" | "generating" | "complete" | "failed";

export type Run = {
  id: string;
  knowledge_base_id: string;
  run_type: RunType;
  input: Record<string, any>; // JSONB - stores { niche_name, geo, notes } and other inputs
  status: RunStatus;
  error: string | null;
  metadata: Record<string, any>; // JSONB - stores used_knowledge_base_ids array and other metadata
  created_by: string | null;
  created_at: string;
  updated_at: string;
};


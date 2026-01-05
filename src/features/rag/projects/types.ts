export type Project = {
  id: string;
  client_name: string;
  slug: string;
  status: 'active' | 'onboarding' | 'delivered' | 'archived';
  kb_id: string; // Required - links to workspace KB
  description: string | null;
  metadata: Record<string, any>;
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


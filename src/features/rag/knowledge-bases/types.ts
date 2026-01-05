export type KnowledgeBase = {
  id: string;
  name: string;
  description: string | null;
  kb_type: string | null; // Legacy field - different from 'type'
  type: string | null; // New field: 'research', 'project', 'company', 'client', 'team'
  visibility: "public" | "private";
  is_active: boolean;
  created_at: string;
  updated_at: string;
};


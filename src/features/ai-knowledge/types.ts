export type AIKnowledge = {
  id: string;
  name: string;
  description: string | null;
  kb_type: string | null;
  visibility: "public" | "private";
  is_active: boolean;
  created_at: string;
  updated_at: string;
};


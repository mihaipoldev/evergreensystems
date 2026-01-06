export type ResearchSubject = {
  id: string;
  name: string;
  geography: string | null;
  category: string | null;
  type: string | null;
  description: string | null;
  first_researched_at: string | null;
  last_researched_at: string | null;
  run_count: number;
  created_at: string;
  updated_at: string;
};


export type Page = {
  id: string;
  title: string;
  description: string | null;
  type: string | null;
  status?: "published" | "draft" | "deactivated";
  order: number;
  created_at: string;
  updated_at: string;
};

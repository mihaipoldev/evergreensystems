export type Page = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  status?: "published" | "draft" | "deactivated";
  created_at: string;
  updated_at: string;
};

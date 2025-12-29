import type { Database } from "@/lib/supabase/types";

export type Media = Database["public"]["Tables"]["media"]["Row"];
export type MediaInsert = Database["public"]["Tables"]["media"]["Insert"];
export type MediaUpdate = Database["public"]["Tables"]["media"]["Update"];

export type SectionMedia = Database["public"]["Tables"]["section_media"]["Row"];
export type SectionMediaInsert = Database["public"]["Tables"]["section_media"]["Insert"];
export type SectionMediaUpdate = Database["public"]["Tables"]["section_media"]["Update"];

export type MediaWithSection = Media & {
  section_media: {
    id: string;
    role: string;
    sort_order: number;
    status: "published" | "draft" | "deactivated";
    created_at: string;
  };
};

export type SectionWithMedia = {
  id: string;
  type: string;
  title: string | null;
  admin_title: string | null;
  subtitle: string | null;
  content: any | null;
  media_url: string | null;
  created_at: string;
  updated_at: string;
  media?: MediaWithSection[];
};

import type { Database } from "@/lib/supabase/types";

export type CTAButton = {
  id: string;
  label: string;
  url: string;
  style: string | null;
  icon: string | null;
  position: number;
  created_at: string;
  updated_at: string;
};

export type SectionCTAButton = Database["public"]["Tables"]["section_cta_buttons"]["Row"];
export type SectionCTAButtonInsert = Database["public"]["Tables"]["section_cta_buttons"]["Insert"];
export type SectionCTAButtonUpdate = Database["public"]["Tables"]["section_cta_buttons"]["Update"];

export type CTAButtonWithSection = CTAButton & {
  section_cta_button: {
    id: string;
    position: number;
    status: "published" | "draft" | "deactivated";
    created_at: string;
  };
};

export type CTAButtonWithSections = CTAButton & {
  sections: Array<{
    id: string;
    title: string | null;
    admin_title: string | null;
    page_section_id?: string;
  }>;
};

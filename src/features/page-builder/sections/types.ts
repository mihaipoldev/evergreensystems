import type { MediaWithSection } from "../media/types";
import type { CTAButtonWithSection } from "../cta/types";

export type Section = {
  id: string;
  type: string;
  title: string | null;
  admin_title: string | null;
  header_title: string | null;
  subtitle: string | null;
  eyebrow: string | null;
  content: any | null;
  media_url: string | null;
  icon: string | null;
  created_at: string;
  updated_at: string;
  media?: MediaWithSection[];
  ctaButtons?: CTAButtonWithSection[];
};

export type SectionWithPages = Section & {
  pages?: Array<{
    id: string;
    title: string;
    page_section_id: string;
    position: number;
    status: "published" | "draft" | "deactivated";
  }>;
};

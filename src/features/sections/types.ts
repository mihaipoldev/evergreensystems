import type { MediaWithSection } from "../media/types";
import type { CTAButtonWithSection } from "../cta/types";

export type Section = {
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
  ctaButtons?: CTAButtonWithSection[];
};

export type SectionWithPages = Section & {
  pages?: Array<{
    id: string;
    slug: string;
    title: string;
    page_section_id: string;
    position: number;
    visible: boolean;
  }>;
};

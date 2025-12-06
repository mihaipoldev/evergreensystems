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

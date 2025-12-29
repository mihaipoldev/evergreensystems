export type SiteStructure = {
  id: string;
  page_type: string;
  slug: string;
  production_page_id: string | null;
  development_page_id: string | null;
  created_at: string;
  updated_at: string;
};

export type SiteStructureWithPage = SiteStructure & {
  production_page: {
    id: string;
    title: string;
    variant: string | null;
  } | null;
  development_page: {
    id: string;
    title: string;
    variant: string | null;
  } | null;
};

export type Software = {
  id: string;
  name: string;
  slug: string;
  website_url: string;
  icon: string | null;
  created_at: string;
  updated_at: string;
};

export type SectionSoftware = {
  id: string;
  section_id: string;
  software_id: string;
  order: number;
  icon_override: string | null;
  status: "published" | "draft" | "deactivated";
  created_at: string;
};

export type SoftwareWithSection = Software & {
  section_software: {
    id: string;
    order: number;
    icon_override: string | null;
    status: "published" | "draft" | "deactivated";
    created_at: string;
  };
};

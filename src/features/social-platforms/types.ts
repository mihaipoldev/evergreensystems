export type SocialPlatform = {
  id: string;
  name: string;
  icon: string | null;
  base_url: string;
  created_at: string;
  updated_at: string;
};

export type SectionSocial = {
  id: string;
  section_id: string;
  platform_id: string;
  order: number;
  status: "published" | "draft" | "deactivated";
  created_at: string;
};

export type SocialPlatformWithSection = SocialPlatform & {
  section_social: {
    id: string;
    order: number;
    status: "published" | "draft" | "deactivated";
    created_at: string;
  };
};

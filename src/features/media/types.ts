import type { Database } from "@/lib/supabase/types";

export type Media = Database["public"]["Tables"]["media"]["Row"];
export type MediaInsert = Database["public"]["Tables"]["media"]["Insert"];
export type MediaUpdate = Database["public"]["Tables"]["media"]["Update"];

/** Media with section junction metadata — used by landing/funnel components */
export type MediaWithSection = Media & {
  section_media: {
    id: string;
    role: string;
    sort_order: number;
    status: "published" | "draft" | "deactivated";
    created_at: string;
  };
};

// ─── Legacy types used by landing/funnel components (temporary) ─────

/** Legacy CTA button type — used by existing landing components via adapter */
export type LegacyCTAButton = {
  id: string;
  label: string;
  url: string;
  subtitle: string | null;
  style: string | null;
  icon: string | null;
  position: number;
  created_at: string;
  updated_at: string;
};

/** Legacy CTA button with section junction metadata */
export type CTAButtonWithSection = LegacyCTAButton & {
  section_cta_button: {
    id: string;
    position: number;
    status: "published" | "draft" | "deactivated";
    created_at: string;
  };
};

/** Legacy testimonial type — used by Testimonials landing component */
export type Testimonial = {
  id: string;
  author_name: string;
  author_role: string | null;
  company_name: string | null;
  headline: string | null;
  quote: string | null;
  avatar_url: string | null;
  rating: number | null;
  position: number;
  created_at: string;
  updated_at: string;
};

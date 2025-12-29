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

export type SectionTestimonial = {
  id: string;
  section_id: string;
  testimonial_id: string;
  position: number;
  status: "published" | "draft" | "deactivated";
  created_at: string;
};

export type TestimonialWithSection = Testimonial & {
  section_testimonial: {
    id: string;
    position: number;
    status: "published" | "draft" | "deactivated";
    created_at: string;
  };
};

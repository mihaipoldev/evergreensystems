export type Testimonial = {
  id: string;
  author_name: string;
  author_role: string | null;
  company_name: string | null;
  headline: string | null;
  quote: string;
  avatar_url: string | null;
  rating: number | null;
  approved: boolean;
  position: number;
  created_at: string;
  updated_at: string;
};

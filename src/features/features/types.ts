export type OfferFeature = {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  icon: string | null;
  position: number;
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
};

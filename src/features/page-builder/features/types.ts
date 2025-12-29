export type OfferFeature = {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  icon: string | null;
  position: number;
  created_at: string;
  updated_at: string;
};

export type SectionFeature = {
  id: string;
  section_id: string;
  feature_id: string;
  position: number;
  created_at: string;
};

export type OfferFeatureWithSection = OfferFeature & {
  section_feature: {
    id: string;
    position: number;
    status: "published" | "draft" | "deactivated";
    created_at: string;
  };
};

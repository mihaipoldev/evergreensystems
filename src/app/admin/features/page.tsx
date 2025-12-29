import { getAllOfferFeatures } from "@/features/page-builder/features/data";
import { FeaturesList } from "@/features/page-builder/features/components/FeaturesList";

export const dynamic = "force-dynamic";

export default async function FeaturesPage() {
  const features = await getAllOfferFeatures();

  return <FeaturesList initialFeatures={features} />;
}

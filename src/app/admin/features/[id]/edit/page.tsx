import { notFound } from "next/navigation";
import { AdminPageTitle } from "@/components/admin/AdminPageTitle";
import { FeatureForm } from "@/features/features/components/FeatureForm";
import { getOfferFeatureById } from "@/features/features/data";

export const dynamic = "force-dynamic";

type EditFeaturePageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditFeaturePage({ params }: EditFeaturePageProps) {
  const { id } = await params;
  const feature = await getOfferFeatureById(id);

  if (!feature) {
    notFound();
  }

  return (
    <div className="w-full space-y-6">
      <div className="mb-6 md:mb-8 relative">
        <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-primary/20 via-primary/10 to-transparent rounded-full" />
        <AdminPageTitle
          title="Edit Feature"
          entityName={feature.title}
          description="Update the feature details"
        />
      </div>
      <FeatureForm initialData={feature} isEdit={true} />
    </div>
  );
}

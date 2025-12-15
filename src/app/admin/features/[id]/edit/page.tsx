import { notFound } from "next/navigation";
import { AdminPageTitle } from "@/components/admin/AdminPageTitle";
import { FeatureForm } from "@/features/features/components/FeatureForm";
import { getOfferFeatureById } from "@/features/features/data";

export const dynamic = "force-dynamic";

type EditFeaturePageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ returnTo?: string }>;
};

export default async function EditFeaturePage({ params, searchParams }: EditFeaturePageProps) {
  const { id } = await params;
  const params_searchParams = await searchParams;
  const returnTo = params_searchParams.returnTo;

  const feature = await getOfferFeatureById(id);

  if (!feature) {
    notFound();
  }

  return (
    <div className="w-full space-y-6">
      <div className="mb-6 md:mb-8">
        <AdminPageTitle
          title="Edit Feature"
          entityName={feature.title}
          description="Update the feature details"
        />
      </div>
      <FeatureForm initialData={feature} isEdit={true} returnTo={returnTo} />
    </div>
  );
}

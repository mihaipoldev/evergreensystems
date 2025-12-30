import { AdminPageTitle } from "@/components/admin/ui/AdminPageTitle";
import { FeatureForm } from "@/features/page-builder/features/components/FeatureForm";

export const dynamic = "force-dynamic";

type NewFeaturePageProps = {
  searchParams: Promise<{ returnTo?: string; sectionId?: string }>;
};

export default async function NewFeaturePage({ searchParams }: NewFeaturePageProps) {
  const params = await searchParams;
  const returnTo = params.returnTo;
  const sectionId = params.sectionId;

  return (
    <div className="w-full space-y-6">
      <div className="mb-6 md:mb-8">
        <AdminPageTitle
          title="New Feature"
          description="Create a new feature to showcase your offerings"
        />
      </div>
      <FeatureForm isEdit={false} returnTo={returnTo} sectionId={sectionId} />
    </div>
  );
}

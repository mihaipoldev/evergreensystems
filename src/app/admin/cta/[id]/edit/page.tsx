import { notFound } from "next/navigation";
import { AdminPageTitle } from "@/components/admin/AdminPageTitle";
import { CTAButtonForm } from "@/features/page-builder/cta/components/CTAButtonForm";
import { getCTAButtonById } from "@/features/page-builder/cta/data";

type EditCTAPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ returnTo?: string }>;
};

export default async function EditCTAPage({ params, searchParams }: EditCTAPageProps) {
  const { id } = await params;
  const params_searchParams = await searchParams;
  const returnTo = params_searchParams.returnTo;

  const ctaButton = await getCTAButtonById(id);

  if (!ctaButton) {
    notFound();
  }

  return (
    <div className="w-full space-y-6">
      <div className="mb-6 md:mb-8">
        <AdminPageTitle
          title="Edit CTA Button"
          entityName={ctaButton.label}
          description="Update the CTA button details"
        />
      </div>
      <CTAButtonForm initialData={ctaButton} isEdit={true} returnTo={returnTo} />
    </div>
  );
}

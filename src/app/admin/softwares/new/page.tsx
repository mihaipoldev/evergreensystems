import { AdminPageTitle } from "@/components/admin/ui/AdminPageTitle";
import { SoftwareForm } from "@/features/page-builder/softwares/components/SoftwareForm";

export const dynamic = "force-dynamic";

type NewSoftwarePageProps = {
  searchParams: Promise<{ returnTo?: string }>;
};

export default async function NewSoftwarePage({ searchParams }: NewSoftwarePageProps) {
  const params = await searchParams;
  const returnTo = params.returnTo;

  return (
    <div className="w-full space-y-6">
      <div className="mb-6 md:mb-8">
        <AdminPageTitle
          title="New Software"
          description="Create a new software product"
        />
      </div>
      <SoftwareForm isEdit={false} returnTo={returnTo} />
    </div>
  );
}

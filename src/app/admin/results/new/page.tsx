import { AdminPageTitle } from "@/components/admin/AdminPageTitle";
import { ResultForm } from "@/features/page-builder/results/components/ResultForm";

export const dynamic = "force-dynamic";

type NewResultPageProps = {
  searchParams: Promise<{ returnTo?: string }>;
};

export default async function NewResultPage({ searchParams }: NewResultPageProps) {
  const params = await searchParams;
  const returnTo = params.returnTo;

  return (
    <div className="w-full space-y-6">
      <div className="mb-6 md:mb-8">
        <AdminPageTitle
          title="New Result"
          description="Create a new result"
        />
      </div>
      <ResultForm isEdit={false} returnTo={returnTo} />
    </div>
  );
}

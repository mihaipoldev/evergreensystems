import { notFound } from "next/navigation";
import { AdminPageTitle } from "@/components/admin/ui/AdminPageTitle";
import { ResultForm } from "@/features/page-builder/results/components/ResultForm";
import { getResultById } from "@/features/page-builder/results/queries";

export const dynamic = "force-dynamic";

type EditResultPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ returnTo?: string }>;
};

export default async function EditResultPage({ params, searchParams }: EditResultPageProps) {
  const { id } = await params;
  const params_searchParams = await searchParams;
  const returnTo = params_searchParams.returnTo;

  const result = await getResultById(id);

  if (!result) {
    notFound();
  }

  // Extract a meaningful name from content if available
  const entityName = result.content?.title 
    ? String(result.content.title)
    : result.content?.subtitle
    ? String(result.content.subtitle)
    : "Result";

  return (
    <div className="w-full space-y-6">
      <div className="mb-6 md:mb-8">
        <AdminPageTitle
          title="Edit Result"
          entityName={entityName}
          description="Update the result content"
        />
      </div>
      <ResultForm initialData={result} isEdit={true} returnTo={returnTo} />
    </div>
  );
}

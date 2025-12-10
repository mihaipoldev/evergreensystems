import { notFound } from "next/navigation";
import { AdminPageTitle } from "@/components/admin/AdminPageTitle";
import { PageForm } from "@/features/pages/components/PageForm";
import { getPageById } from "@/features/pages/data";

type EditPagePageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditPagePage({ params }: EditPagePageProps) {
  const { id } = await params;
  const page = await getPageById(id);

  if (!page) {
    notFound();
  }

  return (
    <div className="w-full space-y-6">
      <div className="mb-6 md:mb-8 relative">
        <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-primary/20 via-primary/10 to-transparent rounded-full" />
        <AdminPageTitle
          title="Edit Page"
          entityName={page.title}
          description="Update the page details"
        />
      </div>
      <PageForm initialData={page} isEdit={true} />
    </div>
  );
}

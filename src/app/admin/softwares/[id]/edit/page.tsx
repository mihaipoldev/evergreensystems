import { notFound } from "next/navigation";
import { AdminPageTitle } from "@/components/admin/ui/AdminPageTitle";
import { SoftwareForm } from "@/features/page-builder/softwares/components/SoftwareForm";
import { getSoftwareById } from "@/features/page-builder/softwares/queries";

export const dynamic = "force-dynamic";

type EditSoftwarePageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ returnTo?: string }>;
};

export default async function EditSoftwarePage({ params, searchParams }: EditSoftwarePageProps) {
  const { id } = await params;
  const params_searchParams = await searchParams;
  const returnTo = params_searchParams.returnTo;

  const software = await getSoftwareById(id);

  if (!software) {
    notFound();
  }

  return (
    <div className="w-full space-y-6">
      <div className="mb-6 md:mb-8">
        <AdminPageTitle
          title="Edit Software"
          entityName={software.name}
          description="Update the software details"
        />
      </div>
      <SoftwareForm initialData={software} isEdit={true} returnTo={returnTo} />
    </div>
  );
}

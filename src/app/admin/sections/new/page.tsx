import { AdminPageTitle } from "@/components/admin/AdminPageTitle";
import { SectionForm } from "@/features/page-builder/sections/components/SectionForm";

export const dynamic = "force-dynamic";

export default async function NewSectionPage() {
  return (
    <div className="w-full space-y-6">
      <div className="mb-6 md:mb-8">
        <AdminPageTitle
          title="New Section"
          description="Create a new reusable section"
        />
      </div>
      <SectionForm isEdit={false} />
    </div>
  );
}

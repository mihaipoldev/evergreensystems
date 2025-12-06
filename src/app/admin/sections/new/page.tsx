import { AdminPageTitle } from "@/components/admin/AdminPageTitle";
import { SectionForm } from "@/features/sections/components/SectionForm";

export const dynamic = "force-dynamic";

export default async function NewSectionPage() {
  return (
    <div className="w-full space-y-6">
      <div className="mb-6 md:mb-8 relative">
        <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-primary/20 via-primary/10 to-transparent rounded-full" />
        <AdminPageTitle
          title="New Section"
          description="Create a new reusable section"
        />
      </div>
      <SectionForm isEdit={false} />
    </div>
  );
}

import { AdminPageTitle } from "@/components/admin/AdminPageTitle";
import { PageForm } from "@/features/pages/components/PageForm";

export const dynamic = "force-dynamic";

export default async function NewPagePage() {
  return (
    <div className="w-full space-y-6">
      <div className="mb-6 md:mb-8">
        <AdminPageTitle
          title="New Page"
          description="Create a new page for your site"
        />
      </div>
      <PageForm isEdit={false} />
    </div>
  );
}

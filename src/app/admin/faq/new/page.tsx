import { AdminPageTitle } from "@/components/admin/ui/AdminPageTitle";
import { FAQForm } from "@/features/page-builder/faq/components/FAQForm";

export const dynamic = "force-dynamic";

type NewFAQPageProps = {
  searchParams: Promise<{ returnTo?: string; sectionId?: string }>;
};

export default async function NewFAQPage({ searchParams }: NewFAQPageProps) {
  const params = await searchParams;
  const returnTo = params.returnTo;
  const sectionId = params.sectionId;

  return (
    <div className="w-full space-y-6">
      <div className="mb-6 md:mb-8">
        <AdminPageTitle
          title="New FAQ Item"
          description="Create a new frequently asked question"
        />
      </div>
      <FAQForm isEdit={false} returnTo={returnTo} sectionId={sectionId} />
    </div>
  );
}

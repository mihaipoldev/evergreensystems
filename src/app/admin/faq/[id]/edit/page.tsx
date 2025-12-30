import { notFound } from "next/navigation";
import { AdminPageTitle } from "@/components/admin/ui/AdminPageTitle";
import { FAQForm } from "@/features/page-builder/faq/components/FAQForm";
import { getFAQItemById } from "@/features/page-builder/faq/queries";

export const dynamic = "force-dynamic";

type EditFAQPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ returnTo?: string }>;
};

export default async function EditFAQPage({ params, searchParams }: EditFAQPageProps) {
  const { id } = await params;
  const params_searchParams = await searchParams;
  const returnTo = params_searchParams.returnTo;

  const faqItem = await getFAQItemById(id);

  if (!faqItem) {
    notFound();
  }

  return (
    <div className="w-full space-y-6">
      <div className="mb-6 md:mb-8">
        <AdminPageTitle
          title="Edit FAQ Item"
          entityName={faqItem.question}
          description="Update the FAQ item details"
        />
      </div>
      <FAQForm initialData={faqItem} isEdit={true} returnTo={returnTo} />
    </div>
  );
}

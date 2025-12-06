import { notFound } from "next/navigation";
import { AdminPageTitle } from "@/components/admin/AdminPageTitle";
import { FAQForm } from "@/features/faq/components/FAQForm";
import { getFAQItemById } from "@/features/faq/data";

export const dynamic = "force-dynamic";

type EditFAQPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditFAQPage({ params }: EditFAQPageProps) {
  const { id } = await params;
  const faqItem = await getFAQItemById(id);

  if (!faqItem) {
    notFound();
  }

  return (
    <div className="w-full space-y-6">
      <div className="mb-6 md:mb-8 relative">
        <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-primary/20 via-primary/10 to-transparent rounded-full" />
        <AdminPageTitle
          title="Edit FAQ Item"
          entityName={faqItem.question}
          description="Update the FAQ item details"
        />
      </div>
      <FAQForm initialData={faqItem} isEdit={true} />
    </div>
  );
}

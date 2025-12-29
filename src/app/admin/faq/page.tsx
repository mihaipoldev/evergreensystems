import { getAllFAQItems } from "@/features/page-builder/faq/data";
import { FAQList } from "@/features/page-builder/faq/components/FAQList";

export const dynamic = 'force-dynamic';

export default async function FAQPage() {
  const faqItems = await getAllFAQItems();

  return <FAQList initialFAQItems={faqItems} />;
}

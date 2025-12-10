import { getAllFAQItems } from "@/features/faq/data";
import { FAQList } from "@/features/faq/components/FAQList";

export default async function FAQPage() {
  const faqItems = await getAllFAQItems();

  return <FAQList initialFAQItems={faqItems} />;
}

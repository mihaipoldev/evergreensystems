import { getAllCTAButtonsWithSections } from "@/features/cta/data";
import { CTAButtonsList } from "@/features/cta/components/CTAButtonsList";

export default async function CTAPage() {
  const ctaButtons = await getAllCTAButtonsWithSections();

  return <CTAButtonsList initialCTAButtons={ctaButtons || []} />;
}

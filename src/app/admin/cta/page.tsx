import { getAllCTAButtons } from "@/features/cta/data";
import { CTAButtonsList } from "@/features/cta/components/CTAButtonsList";

export default async function CTAPage() {
  const ctaButtons = await getAllCTAButtons();

  return <CTAButtonsList initialCTAButtons={ctaButtons || []} />;
}

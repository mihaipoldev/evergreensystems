import { getAllCTAButtonsWithSections } from "@/features/cta/data";
import { CTAButtonsList } from "@/features/cta/components/CTAButtonsList";

export const dynamic = 'force-dynamic';

export default async function CTAPage() {
  const ctaButtons = await getAllCTAButtonsWithSections();

  return <CTAButtonsList initialCTAButtons={ctaButtons || []} />;
}

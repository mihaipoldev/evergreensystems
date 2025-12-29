import { getAllCTAButtonsWithSections } from "@/features/page-builder/cta/data";
import { CTAButtonsList } from "@/features/page-builder/cta/components/CTAButtonsList";

export const dynamic = 'force-dynamic';

export default async function CTAPage() {
  const ctaButtons = await getAllCTAButtonsWithSections();

  return <CTAButtonsList initialCTAButtons={ctaButtons || []} />;
}

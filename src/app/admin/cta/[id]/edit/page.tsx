import { notFound } from "next/navigation";
import { EditCTAButtonClient } from "./EditCTAButtonClient";
import { getCTAButtonById } from "@/features/cta/data";

type EditCTAPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditCTAPage({ params }: EditCTAPageProps) {
  const { id } = await params;
  const ctaButton = await getCTAButtonById(id);

  if (!ctaButton) {
    notFound();
  }

  return <EditCTAButtonClient ctaButton={ctaButton} />;
}

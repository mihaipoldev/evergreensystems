"use client";

import dynamic from "next/dynamic";
import { AdminPageTitle } from "@/components/admin/AdminPageTitle";
import type { CTAButton } from "@/features/cta/types";

const CTAButtonForm = dynamic(
  () => import("@/features/cta/components/CTAButtonForm").then((mod) => mod.CTAButtonForm),
  { ssr: false }
);

type EditCTAButtonClientProps = {
  ctaButton: CTAButton & { section_id?: string | null };
};

export function EditCTAButtonClient({ ctaButton }: EditCTAButtonClientProps) {
  return (
    <CTAButtonForm
      initialData={ctaButton}
      isEdit={true}
      rightSideHeaderContent={
        <div className="mb-6 md:mb-8 relative">
          <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-primary/20 via-primary/10 to-transparent rounded-full" />
          <AdminPageTitle
            title="Edit CTA Button"
            entityName={ctaButton.label}
            description="Update the CTA button details"
          />
        </div>
      }
    />
  );
}

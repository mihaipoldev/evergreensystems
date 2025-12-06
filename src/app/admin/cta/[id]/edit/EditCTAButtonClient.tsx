"use client";

import { AdminPageTitle } from "@/components/admin/AdminPageTitle";
import { CTAButtonForm } from "@/features/cta/components/CTAButtonForm";
import type { CTAButton } from "@/features/cta/types";

type EditCTAButtonClientProps = {
  ctaButton: CTAButton;
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

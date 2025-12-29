"use client";

import dynamic from "next/dynamic";
import { AdminPageTitle } from "@/components/admin/AdminPageTitle";
import type { CTAButton } from "@/features/page-builder/cta/types";

const CTAButtonForm = dynamic(
  () => import("@/features/page-builder/cta/components/CTAButtonForm").then((mod) => mod.CTAButtonForm),
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
        <div className="mb-6 md:mb-8">
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

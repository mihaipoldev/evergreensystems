"use client";

import { AdminPageTitle } from "@/components/admin/AdminPageTitle";
import { ApprovedSwitchForm } from "@/components/admin/ApprovedSwitchForm";
import { TestimonialForm } from "@/features/page-builder/testimonials/components/TestimonialForm";
import type { Testimonial } from "@/features/page-builder/testimonials/types";

type EditTestimonialClientProps = {
  testimonial: Testimonial;
};

export function EditTestimonialClient({ testimonial }: EditTestimonialClientProps) {
  return (
    <TestimonialForm
      initialData={testimonial}
      isEdit={true}
      rightSideHeaderContent={
        <div className="mb-6 md:mb-8">
          <AdminPageTitle
            title="Edit Testimonial"
            entityName={testimonial.author_name}
            description="Update the testimonial details"
            rightSideContent={<ApprovedSwitchForm />}
          />
        </div>
      }
    />
  );
}

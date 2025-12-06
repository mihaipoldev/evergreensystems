"use client";

import { AdminPageTitle } from "@/components/admin/AdminPageTitle";
import { ApprovedSwitchForm } from "@/components/admin/ApprovedSwitchForm";
import { TestimonialForm } from "@/features/testimonials/components/TestimonialForm";
import type { Testimonial } from "@/features/testimonials/types";

type EditTestimonialClientProps = {
  testimonial: Testimonial;
};

export function EditTestimonialClient({ testimonial }: EditTestimonialClientProps) {
  return (
    <TestimonialForm
      initialData={testimonial}
      isEdit={true}
      rightSideHeaderContent={
        <div className="mb-6 md:mb-8 relative">
          <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-primary/20 via-primary/10 to-transparent rounded-full" />
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

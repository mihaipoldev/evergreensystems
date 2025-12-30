import { notFound } from "next/navigation";
import { AdminPageTitle } from "@/components/admin/ui/AdminPageTitle";
import { ApprovedSwitchForm } from "@/components/admin/status/ApprovedSwitchForm";
import { TestimonialForm } from "@/features/page-builder/testimonials/components/TestimonialForm";
import { getTestimonialById } from "@/features/page-builder/testimonials/queries";

type EditTestimonialPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ returnTo?: string }>;
};

export default async function EditTestimonialPage({ params, searchParams }: EditTestimonialPageProps) {
  const { id } = await params;
  const params_searchParams = await searchParams;
  const returnTo = params_searchParams.returnTo;

  const testimonial = await getTestimonialById(id);

  if (!testimonial) {
    notFound();
  }

  return (
    <div className="w-full space-y-6">
      <TestimonialForm
        initialData={testimonial}
        isEdit={true}
        returnTo={returnTo}
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
    </div>
  );
}

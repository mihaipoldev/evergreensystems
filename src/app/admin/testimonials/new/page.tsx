import { AdminPageTitle } from "@/components/admin/AdminPageTitle";
import { TestimonialForm } from "@/features/testimonials/components/TestimonialForm";

export const dynamic = "force-dynamic";

type NewTestimonialPageProps = {
  searchParams: Promise<{ returnTo?: string }>;
};

export default async function NewTestimonialPage({ searchParams }: NewTestimonialPageProps) {
  const params = await searchParams;
  const returnTo = params.returnTo;

  return (
    <div className="w-full space-y-6">
      <div className="mb-6 md:mb-8">
        <AdminPageTitle
          title="New Testimonial"
          description="Create a new testimonial to showcase customer feedback"
        />
      </div>
      <TestimonialForm isEdit={false} returnTo={returnTo} />
    </div>
  );
}

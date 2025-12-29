import { getAllTestimonials } from "@/features/page-builder/testimonials/data";
import { TestimonialsList } from "@/features/page-builder/testimonials/components/TestimonialsList";

export const dynamic = 'force-dynamic';

export default async function TestimonialsPage() {
  const testimonials = await getAllTestimonials();

  return <TestimonialsList initialTestimonials={testimonials || []} />;
}

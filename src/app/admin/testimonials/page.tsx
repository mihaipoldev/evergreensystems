import { getAllTestimonials } from "@/features/testimonials/data";
import { TestimonialsList } from "@/features/testimonials/components/TestimonialsList";

export default async function TestimonialsPage() {
  const testimonials = await getAllTestimonials();

  return <TestimonialsList initialTestimonials={testimonials || []} />;
}

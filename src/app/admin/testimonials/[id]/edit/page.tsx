import { notFound } from "next/navigation";
import { EditTestimonialClient } from "./EditTestimonialClient";
import { getTestimonialById } from "@/features/testimonials/data";

export const dynamic = "force-dynamic";

type EditTestimonialPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditTestimonialPage({ params }: EditTestimonialPageProps) {
  const { id } = await params;
  const testimonial = await getTestimonialById(id);

  if (!testimonial) {
    notFound();
  }

  return <EditTestimonialClient testimonial={testimonial} />;
}

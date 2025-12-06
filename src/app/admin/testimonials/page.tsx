"use client";

import { useEffect, useState } from "react";
import { TestimonialsList } from "@/features/testimonials/components/TestimonialsList";
import type { Testimonial } from "@/features/testimonials/types";

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTestimonials() {
      try {
        const response = await fetch("/api/admin/testimonials");
        if (!response.ok) {
          throw new Error("Failed to fetch testimonials");
        }
        const data = await response.json();
        setTestimonials(data || []);
      } catch (error) {
        console.error("Error fetching testimonials:", error);
        setTestimonials([]);
      } finally {
        setLoading(false);
      }
    }

    fetchTestimonials();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading testimonials...</p>
      </div>
    );
  }

  return <TestimonialsList initialTestimonials={testimonials} />;
}

"use client";

import { useEffect, useState } from "react";
import { useParams, notFound } from "next/navigation";
import { EditTestimonialClient } from "./EditTestimonialClient";
import type { Testimonial } from "@/features/testimonials/types";

export default function EditTestimonialPage() {
  const params = useParams();
  const id = params.id as string;
  const [testimonial, setTestimonial] = useState<Testimonial | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchTestimonial() {
      try {
        const response = await fetch(`/api/admin/testimonials/${id}`);
        if (!response.ok) {
          if (response.status === 404) {
            setError(true);
            return;
          }
          throw new Error("Failed to fetch testimonial");
        }
        const data = await response.json();
        setTestimonial(data);
      } catch (error) {
        console.error("Error fetching testimonial:", error);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchTestimonial();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading testimonial...</p>
      </div>
    );
  }

  if (error || !testimonial) {
    notFound();
  }

  return <EditTestimonialClient testimonial={testimonial} />;
}

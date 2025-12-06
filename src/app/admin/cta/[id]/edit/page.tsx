"use client";

import { useEffect, useState } from "react";
import { useParams, notFound } from "next/navigation";
import { EditCTAButtonClient } from "./EditCTAButtonClient";
import type { CTAButton } from "@/features/cta/types";

export default function EditCTAPage() {
  const params = useParams();
  const id = params.id as string;
  const [ctaButton, setCTAButton] = useState<CTAButton | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchCTAButton() {
      try {
        const response = await fetch(`/api/admin/cta-buttons/${id}`);
        if (!response.ok) {
          if (response.status === 404) {
            setError(true);
            return;
          }
          throw new Error("Failed to fetch CTA button");
        }
        const data = await response.json();
        setCTAButton(data);
      } catch (error) {
        console.error("Error fetching CTA button:", error);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchCTAButton();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading CTA button...</p>
      </div>
    );
  }

  if (error || !ctaButton) {
    notFound();
  }

  return <EditCTAButtonClient ctaButton={ctaButton} />;
}

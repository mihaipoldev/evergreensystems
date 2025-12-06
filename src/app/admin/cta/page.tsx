"use client";

import { useEffect, useState } from "react";
import { CTAButtonsList } from "@/features/cta/components/CTAButtonsList";
import type { CTAButton } from "@/features/cta/types";

export default function CTAPage() {
  const [ctaButtons, setCTAButtons] = useState<CTAButton[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCTAButtons() {
      try {
        const response = await fetch("/api/admin/cta-buttons");
        if (!response.ok) {
          throw new Error("Failed to fetch CTA buttons");
        }
        const data = await response.json();
        setCTAButtons(data || []);
      } catch (error) {
        console.error("Error fetching CTA buttons:", error);
        setCTAButtons([]);
      } finally {
        setLoading(false);
      }
    }

    fetchCTAButtons();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading CTA buttons...</p>
      </div>
    );
  }

  return <CTAButtonsList initialCTAButtons={ctaButtons} />;
}

"use client";

import { Suspense, useState, useEffect } from "react";
import { ResearchList } from "@/features/rag/research/components/ResearchList";
import type { ResearchSubject } from "@/features/rag/research/types";

export default function ResearchPage() {
  const [researchSubjects, setResearchSubjects] = useState<ResearchSubject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch("/api/intel/research");
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to fetch research subjects");
        }
        
        const data = await response.json();
        setResearchSubjects(data || []);
      } catch (err) {
        console.error("Error fetching research subjects:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (error) {
    return (
      <div className="w-full space-y-6">
        <div className="text-center py-12">
          <p className="text-destructive">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <ResearchList initialResearchSubjects={researchSubjects} />
    </div>
  );
}


"use client";

import { Suspense, useState, useEffect } from "react";
import { SubjectTypesList } from "@/features/rag/subject-type/components/SubjectTypesList";
import type { SubjectType } from "@/features/rag/subject-type/types";

export default function SubjectTypesPage() {
  const [subjectTypes, setSubjectTypes] = useState<SubjectType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch("/api/intel/subject-types");
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to fetch subject types");
        }
        
        const data = await response.json();
        setSubjectTypes(data || []);
      } catch (err) {
        console.error("Error fetching subject types:", err);
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
      <SubjectTypesList initialSubjectTypes={subjectTypes} />
    </div>
  );
}


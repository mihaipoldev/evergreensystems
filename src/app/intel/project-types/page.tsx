"use client";

import { Suspense, useState, useEffect } from "react";
import { ProjectTypesList } from "@/features/rag/project-type/components/ProjectTypesList";
import type { ProjectType } from "@/features/rag/project-type/types";

export default function ProjectTypesPage() {
  const [projectTypes, setProjectTypes] = useState<ProjectType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch("/api/intel/project-types");
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to fetch project types");
        }
        
        const data = await response.json();
        setProjectTypes(data || []);
      } catch (err) {
        console.error("Error fetching project types:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (error) {
    return (
      <div className="w-full">
        <div className="text-center py-12">
          <p className="text-destructive">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <ProjectTypesList initialProjectTypes={projectTypes} />
    </div>
  );
}


"use client";

import { Suspense, useState, useEffect } from "react";
import { ProjectList } from "@/features/rag/projects/components/ProjectList";
import type { Project } from "@/features/rag/projects/types";

type ProjectWithCount = Project & { document_count?: number };

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch("/api/intel/projects");
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to fetch projects");
        }
        
        const data = await response.json();
        setProjects(data || []);
      } catch (err) {
        console.error("Error fetching projects:", err);
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
      <ProjectList initialProjects={projects} />
    </div>
  );
}


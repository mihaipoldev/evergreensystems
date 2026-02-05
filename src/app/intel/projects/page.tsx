"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { ProjectsPageWithTabs } from "@/features/rag/projects/components/ProjectsPageWithTabs";
import type { Project } from "@/features/rag/projects/types";

type ProjectWithCount = Project & { document_count?: number };

function ProjectsPageContent() {
  const searchParams = useSearchParams();
  const [projects, setProjects] = useState<ProjectWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        
        // Get project_type_id from URL search params
        const projectTypeId = searchParams.get("project_type_id");
        
        // Build API URL with query parameter if present
        const apiUrl = projectTypeId 
          ? `/api/intel/projects?project_type_id=${encodeURIComponent(projectTypeId)}`
          : "/api/intel/projects";
        
        const response = await fetch(apiUrl);
        
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
  }, [searchParams]);

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
      <ProjectsPageWithTabs initialProjects={projects} />
    </div>
  );
}

export default function ProjectsPage() {
  return (
    <Suspense fallback={
      <div className="w-full">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading projects...</p>
        </div>
      </div>
    }>
      <ProjectsPageContent />
    </Suspense>
  );
}


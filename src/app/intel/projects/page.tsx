"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ProjectsPageWithTabs } from "@/features/rag/projects/components/ProjectsPageWithTabs";
import { useProjects } from "@/features/rag/projects/hooks/useProjects";
import { useProjectTypes } from "@/features/rag/projects/hooks/useProjectTypes";

function ProjectsPageContent() {
  const searchParams = useSearchParams();
  const projectTypeId = searchParams.get("project_type_id");

  const { data: projects = [], error: projectsError, isLoading: projectsLoading } = useProjects(projectTypeId);
  const { data: projectTypes = [], isLoading: typesLoading } = useProjectTypes();

  const projectType = projectTypeId
    ? projectTypes.find((pt) => pt.id === projectTypeId) ?? null
    : null;

  // Wait for project type info before rendering so the page shows the correct
  // title, icon, and columns from the first frame (no flash of generic state).
  // After the first load, project types are cached for 5 min so this is instant.
  if ((projectTypeId && typesLoading) || projectsLoading) {
    return null;
  }

  if (projectsError) {
    return (
      <div className="w-full">
        <div className="text-center py-12">
          <p className="text-destructive">
            {projectsError instanceof Error ? projectsError.message : "An error occurred"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <ProjectsPageWithTabs initialProjects={projects} projectType={projectType} />
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

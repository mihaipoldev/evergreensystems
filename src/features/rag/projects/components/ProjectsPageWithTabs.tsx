"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFolder } from "@fortawesome/free-solid-svg-icons";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PageTitle } from "@/features/rag/shared/components/PageTitle";
import { ProjectList } from "./ProjectList";
import { ResearchesContent } from "./ResearchesContent";
import type { Project } from "../types";
import type { ProjectType } from "@/features/rag/project-type/types";

type ProjectWithCount = Project & { document_count?: number };

type ProjectsPageWithTabsProps = {
  initialProjects: ProjectWithCount[];
};

const STORAGE_KEY_TAB = "projects-page-tab";

function getStoredTab(): string {
  if (typeof window === "undefined") return "projects";
  try {
    const saved = localStorage.getItem(STORAGE_KEY_TAB);
    return saved === "researches" ? "researches" : "projects";
  } catch {
    return "projects";
  }
}

function setStoredTab(value: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_TAB, value);
  } catch {
    // Ignore
  }
}

export function ProjectsPageWithTabs({ initialProjects }: ProjectsPageWithTabsProps) {
  const searchParams = useSearchParams();
  const [projectTypes, setProjectTypes] = useState<ProjectType[]>([]);
  const [activeTab, setActiveTab] = useState(getStoredTab);

  // Fetch project types for title
  useEffect(() => {
    async function fetchProjectTypes() {
      try {
        const response = await fetch("/api/intel/project-types?enabled=true");
        if (!response.ok) return;
        const data = await response.json();
        setProjectTypes(data || []);
      } catch {
        // Ignore
      }
    }
    fetchProjectTypes();
  }, []);

  const projectTypeId = searchParams.get("project_type_id");
  const selectedProjectType = projectTypes.find((pt) => pt.id === projectTypeId);
  const pageTitle = selectedProjectType
    ? `${selectedProjectType.label || selectedProjectType.name} Projects`
    : "Projects";

  useEffect(() => {
    setStoredTab(activeTab);
  }, [activeTab]);

  return (
    <div className="w-full space-y-6">
      <PageTitle
        icon={
          <FontAwesomeIcon icon={faFolder} className="h-5 w-5 md:h-6 md:w-6 text-muted-foreground" />
        }
        title={pageTitle}
      />

      <section className="relative">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex justify-start mb-4 -mt-4 border-b border-border/100">
            <TabsList className="bg-transparent h-auto p-0 gap-6 border-none">
              <TabsTrigger
                value="projects"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 py-2 text-sm font-medium text-muted-foreground data-[state=active]:text-foreground border-b-2 border-transparent data-[state=active]:border-foreground rounded-none transition-colors hover:text-foreground -mb-[1px]"
              >
                Projects
              </TabsTrigger>
              <TabsTrigger
                value="researches"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 py-2 text-sm font-medium text-muted-foreground data-[state=active]:text-foreground border-b-2 border-transparent data-[state=active]:border-foreground rounded-none transition-colors hover:text-foreground -mb-[1px]"
              >
                Researches
              </TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="projects" className="mt-0">
            <ProjectList initialProjects={initialProjects} />
          </TabsContent>
          <TabsContent value="researches" className="mt-0">
            <ResearchesContent projectTypeId={projectTypeId || null} />
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}

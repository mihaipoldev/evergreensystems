"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFolder } from "@fortawesome/free-solid-svg-icons";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PageTitle } from "@/features/rag/shared/components/PageTitle";
import { ProjectList } from "./ProjectList";
import { ResearchesContent } from "./ResearchesContent";
import type { Project } from "../types";
import type { ProjectType } from "@/features/rag/project-type/types";
import { usePrefetchRuns } from "@/features/rag/runs/hooks/useRuns";

type ProjectWithCount = Project & { document_count?: number };

type ProjectsPageWithTabsProps = {
  initialProjects: ProjectWithCount[];
  projectType?: ProjectType | null;
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

export function ProjectsPageWithTabs({ initialProjects, projectType }: ProjectsPageWithTabsProps) {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState(getStoredTab);
  // Lazy-mount: only render ResearchesContent after the tab has been visited once,
  // then keep it mounted so subsequent switches are instant (no mount/unmount).
  const [hasVisitedResearches, setHasVisitedResearches] = useState(() => getStoredTab() === "researches");

  const prefetchRuns = usePrefetchRuns();
  const projectTypeId = searchParams.get("project_type_id");
  const pageTitle = projectType
    ? `${projectType.label || projectType.name} Projects`
    : "Projects";

  const pageIcon = projectType?.icon ? (
    <span className="text-lg md:text-2xl shrink-0">{projectType.icon}</span>
  ) : (
    <FontAwesomeIcon icon={faFolder} className="h-5 w-5 md:h-6 md:w-6 text-muted-foreground" />
  );

  useEffect(() => {
    setStoredTab(activeTab);
    if (activeTab === "researches") {
      setHasVisitedResearches(true);
    }
  }, [activeTab]);

  return (
    <div className="w-full space-y-6">
      <PageTitle
        icon={pageIcon}
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
                onMouseEnter={() => prefetchRuns(projectTypeId)}
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 py-2 text-sm font-medium text-muted-foreground data-[state=active]:text-foreground border-b-2 border-transparent data-[state=active]:border-foreground rounded-none transition-colors hover:text-foreground -mb-[1px]"
              >
                Researches
              </TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="projects" className="mt-0 data-[state=inactive]:hidden" forceMount>
            <motion.div
              animate={activeTab === "projects" ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
              initial={false}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <ProjectList initialProjects={initialProjects} />
            </motion.div>
          </TabsContent>
          <TabsContent value="researches" className="mt-0 data-[state=inactive]:hidden" forceMount>
            <motion.div
              animate={activeTab === "researches" ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
              initial={false}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              {hasVisitedResearches && <ResearchesContent projectTypeId={projectTypeId || null} />}
            </motion.div>
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}

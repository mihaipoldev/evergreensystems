"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleInfo,
  faClock,
  faDatabase,
  faDollarSign,
  faExclamationTriangle,
  faFileText,
  faLayerGroup,
  faPlay,
  faSpinner,
  faWandMagicSparkles,
  faCalendar,
} from "@fortawesome/free-solid-svg-icons";
import { usePageHeader } from "@/providers/PageHeaderProvider";
import { PageTitle } from "@/features/rag/shared/components/PageTitle";
import { ProjectActionsMenu, type RunForDownload } from "@/features/rag/projects/components/ProjectActionsMenu";
import { ProjectModal } from "@/features/rag/projects/components/ProjectModal";
import { GenerateReportModal } from "@/features/rag/workflows/components/GenerateReportModal";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { ProjectDocumentsClient } from "./ProjectDocumentsClient";
import { ProjectRunsClient } from "@/features/rag/projects/components/ProjectRunsClient";
import { StatCard } from "@/features/rag/shared/components/StatCard";
import { StatusBadge } from "@/features/rag/shared/components/StatusBadge";
import { statusColorMap } from "@/features/rag/shared/config/statusColors";
import { getProjectTypeConfig } from "@/features/rag/projects/config/ProjectTypeConfig";
import type { Project, ProjectWithKB } from "@/features/rag/projects/types";
import type { RAGDocument } from "@/features/rag/documents/document-types";
import type { RunWithExtras } from "@/features/rag/projects/config/ProjectTypeConfig";
import { extractWorkflowResult } from "@/features/rag/runs/utils/extractWorkflowResult";
import { ProjectChatContext } from "@/features/chat/components/ProjectChatContext";

type ProjectDetailClientProps = {
  project: ProjectWithKB;
  initialDocuments: RAGDocument[];
  initialRuns: RunWithExtras[];
  projectTypeName?: string | null;
  projectType?: { name: string; label: string; icon: string | null } | null;
  totalWorkflows?: number;
};

const getStatusVariant = (status: string) => {
  switch (status) {
    case "active":
      return "default";
    case "onboarding":
      return "secondary";
    case "delivered":
      return "outline";
    case "archived":
      return "secondary";
    default:
      return "outline";
  }
};

export function ProjectDetailClient({
  project: initialProject,
  initialDocuments,
  initialRuns,
  projectTypeName: initialProjectTypeName,
  projectType: initialProjectType,
  totalWorkflows = 0,
}: ProjectDetailClientProps) {
  const [project, setProject] = useState(initialProject);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [generateModalWorkflowId, setGenerateModalWorkflowId] = useState<string | null>(null);
  const [runsRefreshTrigger, setRunsRefreshTrigger] = useState(0);
  const [projectTypeName, setProjectTypeName] = useState<string | null>(initialProjectTypeName || null);
  const [runsCount, setRunsCount] = useState(initialRuns.length);
  const [loadingStats, setLoadingStats] = useState(false);
  
  // Get project type configuration
  const projectTypeConfig = getProjectTypeConfig(projectTypeName);
  
  // Get default tab from localStorage or use "runs" as fallback
  const getDefaultTab = () => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(`project-tab-${project.id}`);
      if (saved && projectTypeConfig.tabs.some(tab => tab.id === saved)) {
        return saved;
      }
    }
    return "runs";
  };
  
  const [activeTab, setActiveTab] = useState(getDefaultTab);

  // Save active tab to localStorage when it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(`project-tab-${project.id}`, activeTab);
    }
  }, [activeTab, project.id]);

  // Calculate stats from documents
  const documentsCount = initialDocuments.length;
  const totalChunks = initialDocuments.reduce((sum, doc) => sum + (doc.chunk_count || 0), 0);
  const processingDocuments = initialDocuments.filter((doc) => doc.status === "processing").length;
  const failedDocuments = initialDocuments.filter((doc) => doc.status === "failed").length;

  // Update runs count when initialRuns changes
  useEffect(() => {
    setRunsCount(initialRuns.length);
  }, [initialRuns]);

  const handleEdit = () => {
    setIsEditModalOpen(true);
  };

  const handleEditSuccess = (updatedProject: Project) => {
    // Update project state with the updated data
    // Note: ProjectModal returns Project, but we merge it with existing ProjectWithKB data
    setProject({
      ...updatedProject,
      rag_knowledge_bases: project.rag_knowledge_bases, // Preserve KB info
    });
    setIsEditModalOpen(false);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const isNicheProject = projectTypeName === "niche";
  const displayName = isNicheProject ? project.name : (project.client_name || project.name || "");
  const { setHeader } = usePageHeader();

  useEffect(() => {
    setHeader({
      breadcrumbItems: [
        { href: "/intel/projects", label: "Projects" },
        { label: displayName || "Project" },
      ],
      actions: <ProjectActionsMenu project={project} onEdit={handleEdit} runs={initialRuns.map((r): RunForDownload => ({ id: r.id, report_id: r.report_id ?? null }))} />,
    });
    return () => setHeader(null);
  }, [displayName, project, setHeader, initialRuns]);

  return (
    <>
      <div className="w-full space-y-6">
        <PageTitle
          icon={initialProjectType?.icon ? <span className="shrink-0">{initialProjectType.icon}</span> : undefined}
          title={displayName || "Project"}
          titleActions={
            <div className="flex items-center gap-1 shrink-0">
              <TooltipProvider delayDuration={100}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className="shrink-0 md:h-8 hidden md:flex text-muted-foreground hover:text-foreground transition-colors"
                      aria-label="Project information"
                    >
                      <FontAwesomeIcon icon={faCircleInfo} className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent
                    className="max-w-md"
                    side="bottom"
                    sideOffset={8}
                  >
                    <div className="space-y-3 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground tracking-wider mb-1">Name</p>
                        <p className="text-foreground font-medium">{displayName || "—"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground tracking-wider mb-1">Status</p>
                        <StatusBadge color={statusColorMap[project.status] || "muted"}>
                          {project.status || "—"}
                        </StatusBadge>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground tracking-wider mb-1">Category</p>
                        <p className="text-foreground font-medium">{project.category || "—"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground tracking-wider mb-1">Geography</p>
                        <p className="text-foreground font-medium">{project.geography || "—"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground tracking-wider mb-1">Description</p>
                        <p className="text-foreground font-medium">{project.description || "—"}</p>
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <ProjectActionsMenu project={project} onEdit={handleEdit} runs={initialRuns.map((r): RunForDownload => ({ id: r.id, report_id: r.report_id ?? null }))} />
            </div>
          }
          meta={
            <>
              {project.rag_knowledge_bases && (
                <Link
                  href={`/intel/knowledge-bases/${project.kb_id}`}
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group min-w-0 max-w-full"
                >
                  <FontAwesomeIcon icon={faDatabase} className="h-3.5 w-3.5 flex-shrink-0" />
                  <span className="font-medium truncate min-w-0">{project.rag_knowledge_bases.name}</span>
                </Link>
              )}
              {isNicheProject && (project.first_researched_at || project.last_researched_at) && (
                <>
                  {project.first_researched_at && (
                    <span className="flex items-center gap-2">
                      <FontAwesomeIcon icon={faCalendar} className="h-3 w-3" />
                      <span>First: {formatDate(project.first_researched_at)}</span>
                    </span>
                  )}
                  {project.last_researched_at && (
                    <span className="flex items-center gap-2">
                      <FontAwesomeIcon icon={faClock} className="h-3 w-3" />
                      <span>Last: {formatDate(project.last_researched_at)}</span>
                    </span>
                  )}
                </>
              )}
            </>
          }
        />

        {/* Tabs */}
        <section className="relative">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex justify-start mb-4 -mt-4 border-b border-border/100">
              <TabsList className="bg-transparent h-auto p-0 gap-6 border-none">
                {projectTypeConfig.tabs.map((tab) => (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 py-2 text-sm font-medium text-muted-foreground data-[state=active]:text-foreground border-b-2 border-transparent data-[state=active]:border-foreground rounded-none transition-colors hover:text-foreground -mb-[1px]"
                  >
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
            {projectTypeConfig.tabs.map((tab) => (
              <TabsContent key={tab.id} value={tab.id} className="mt-0">
                {tab.id === "documents" && (
                  <div className="space-y-4">
                    {/* Document Stats - Always 4 cards */}
                    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-6">
                      <StatCard
                        title="Total Documents"
                        value={documentsCount}
                        icon={faFileText}
                        index={0}
                      />
                      <StatCard
                        title="Total Chunks"
                        value={totalChunks}
                        icon={faLayerGroup}
                        index={1}
                      />
                      <StatCard
                        title="Processing"
                        value={processingDocuments}
                        icon={faSpinner}
                        index={2}
                      />
                      <StatCard
                        title="Failed"
                        value={failedDocuments}
                        icon={faExclamationTriangle}
                        changeType={failedDocuments > 0 ? "negative" : undefined}
                        index={3}
                      />
                    </div>
                    <ProjectDocumentsClient
                      initialDocuments={initialDocuments}
                      projectId={project.id}
                      projectName={project.client_name || project.name || ""}
                      kbId={project.kb_id}
                      kbName={project.rag_knowledge_bases?.name || null}
                    />
                  </div>
                )}
                {tab.id === "runs" && (
                  <div className="space-y-4">
                    {/* Research Stats - 4 cards for niche projects */}
                    {isNicheProject ? (
                      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-6">
                        {/* Card 1: Fit Score from niche_fit_evaluation workflow */}
                        {(() => {
                          const fitEvaluationRun = initialRuns.find(
                            run => run.workflow_name === "niche_fit_evaluation" && run.status === "complete"
                          );
                          const workflowResult = fitEvaluationRun ? extractWorkflowResult(fitEvaluationRun) : null;
                          const fitScore = workflowResult?.score;
                          const verdict = workflowResult?.verdict;
                          const formattedScore = fitScore !== null && fitScore !== undefined ? fitScore.toFixed(1) : null;
                          return (
                            <StatCard
                              title="Fit Score"
                              value={formattedScore !== null ? `${formattedScore}/100` : "—"}
                              icon={faWandMagicSparkles}
                              index={0}
                              fit_score={fitScore ?? null}
                              verdict={verdict || null}
                            />
                          );
                        })()}
                        {/* Card 2: Total Usage */}
                        <StatCard
                          title="Total Usage"
                          value={`$${(project.total_usage ?? 0).toFixed(2)}`}
                          icon={faDollarSign}
                          index={1}
                        />
                        {/* Card 3: Total Researched */}
                        {(() => {
                          // Count unique workflows that have been run
                          const uniqueWorkflows = new Set(
                            initialRuns
                              .map(run => run.workflow_name)
                              .filter((name): name is string => name !== null && name !== undefined)
                          );
                          const uniqueWorkflowsCount = uniqueWorkflows.size;
                          return (
                            <StatCard
                              title="Total Researched"
                              value={totalWorkflows > 0 ? `${uniqueWorkflowsCount}/${totalWorkflows}` : uniqueWorkflowsCount.toString()}
                              icon={faPlay}
                              index={2}
                            />
                          );
                        })()}
                        {/* Card 4: Last Researched */}
                        <StatCard
                          title="Last Researched"
                          value={project.last_researched_at ? formatDate(project.last_researched_at) : "Never"}
                          icon={faClock}
                          index={3}
                        />
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-6">
                        <StatCard
                          title="Completed"
                          value={initialRuns.filter(run => run.status === "complete").length}
                          icon={faPlay}
                          index={0}
                        />
                        <StatCard
                          title="Total Usage"
                          value={`$${(project.total_usage ?? 0).toFixed(2)}`}
                          icon={faDollarSign}
                          index={1}
                        />
                        <StatCard
                          title="Total Researches"
                          value={runsCount}
                          icon={faPlay}
                          index={2}
                        />
                        <StatCard
                          title="In Progress"
                          value={initialRuns.filter(run =>
                            run.status === "queued" ||
                            run.status === "collecting" ||
                            run.status === "ingesting" ||
                            run.status === "generating"
                          ).length}
                          icon={faSpinner}
                          index={3}
                        />
                      </div>
                    )}
                    <ProjectRunsClient
                      initialRuns={initialRuns}
                      projectId={project.id}
                      projectTypeId={project.project_type_id || null}
                      refreshTrigger={runsRefreshTrigger}
                      onGenerateClick={() => {
                        setGenerateModalWorkflowId(null);
                        setIsGenerateModalOpen(true);
                      }}
                      onGenerateWorkflowClick={(workflowId) => {
                        setGenerateModalWorkflowId(workflowId);
                        setIsGenerateModalOpen(true);
                      }}
                    />
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </section>
      </div>

      <ProjectModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        initialData={project}
        onSuccess={handleEditSuccess}
      />

      <GenerateReportModal
        open={isGenerateModalOpen}
        onOpenChange={(open) => {
          setIsGenerateModalOpen(open);
          if (!open) {
            setGenerateModalWorkflowId(null);
            // Trigger immediate refresh so new run appears in table right away
            setRunsRefreshTrigger((prev) => prev + 1);
          }
        }}
        projectType={projectTypeName || null}
        projectTypeId={project.project_type_id || null}
        researchSubjectId={project.id}
        researchSubjectName={project.name || project.client_name || ""}
        researchSubjectGeography={project.geography || null}
        researchSubjectDescription={project.description || null}
        researchSubjectCategory={project.category || null}
        initialWorkflowId={generateModalWorkflowId}
      />

      {/* Set chat context for this project */}
      <ProjectChatContext 
        projectId={project.id} 
        projectName={project.client_name || project.name || 'Untitled Project'} 
      />
    </>
  );
}

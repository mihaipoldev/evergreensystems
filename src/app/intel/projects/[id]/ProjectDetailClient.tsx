"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFileText,
  faLayerGroup,
  faPlay,
  faSpinner,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";
import { ProjectActionsMenu } from "@/features/rag/projects/components/ProjectActionsMenu";
import { ProjectModal } from "@/features/rag/projects/components/ProjectModal";
import { ProjectDocumentsClient } from "./ProjectDocumentsClient";
import { StatCard } from "@/features/rag/shared/components/StatCard";
import type { Project, ProjectWithKB } from "@/features/rag/projects/types";
import type { RAGDocument } from "@/features/rag/documents/document-types";

type ProjectDetailClientProps = {
  project: ProjectWithKB;
  initialDocuments: RAGDocument[];
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
}: ProjectDetailClientProps) {
  const [project, setProject] = useState(initialProject);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [runsCount, setRunsCount] = useState(0);
  const [loadingStats, setLoadingStats] = useState(true);

  // Calculate stats from documents
  const documentsCount = initialDocuments.length;
  const totalChunks = initialDocuments.reduce((sum, doc) => sum + (doc.chunk_count || 0), 0);
  const processingDocuments = initialDocuments.filter((doc) => doc.status === "processing").length;
  const failedDocuments = initialDocuments.filter((doc) => doc.status === "failed").length;

  // Fetch runs count for this project's knowledge base
  useEffect(() => {
    async function fetchRunsCount() {
      try {
        const response = await fetch(`/api/intel/runs`);
        if (response.ok) {
          const runsData = await response.json();
          // Filter runs for this project's KB
          const projectRuns = (runsData || []).filter(
            (run: any) => run.knowledge_base_id === project.kb_id
          );
          setRunsCount(projectRuns.length);
        }
      } catch (error) {
        console.error("Error fetching runs count:", error);
      } finally {
        setLoadingStats(false);
      }
    }

    fetchRunsCount();
  }, [project.kb_id]);

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

  return (
    <>
      <div className="w-full space-y-6">
        <div className="flex items-start justify-between gap-4 mb-6 md:mb-8">
          <div>
            <p className="text-sm text-muted-foreground mb-2">Manage documents for this project.</p>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                variant={getStatusVariant(project.status)}
                className="text-xs capitalize"
              >
                {project.status}
              </Badge>
              {project.rag_knowledge_bases && (
                <Badge variant="outline" className="text-xs">
                  KB: {project.rag_knowledge_bases.name}
                </Badge>
              )}
            </div>
          </div>
          <ProjectActionsMenu
            project={project}
            onEdit={handleEdit}
          />
        </div>

        {/* Stats Grid */}
        <section className="relative">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
              title="Total Runs"
              value={loadingStats ? "..." : runsCount}
              icon={faPlay}
              index={2}
            />
          </div>
        </section>

        {/* Additional Status Cards */}
        {(processingDocuments > 0 || failedDocuments > 0) && (
          <section className="relative">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {processingDocuments > 0 && (
                <StatCard
                  title="Processing"
                  value={processingDocuments}
                  icon={faSpinner}
                  index={3}
                />
              )}
              {failedDocuments > 0 && (
                <StatCard
                  title="Failed"
                  value={failedDocuments}
                  icon={faExclamationTriangle}
                  changeType="negative"
                  index={4}
                />
              )}
            </div>
          </section>
        )}

        <ProjectDocumentsClient
          initialDocuments={initialDocuments}
          projectId={project.id}
          projectName={project.client_name}
          kbId={project.kb_id}
          kbName={project.rag_knowledge_bases?.name || null}
        />
      </div>

      <ProjectModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        initialData={project}
        onSuccess={handleEditSuccess}
      />
    </>
  );
}

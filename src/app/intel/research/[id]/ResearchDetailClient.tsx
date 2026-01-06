"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlay,
  faClock,
  faCalendar,
  faWandMagicSparkles,
} from "@fortawesome/free-solid-svg-icons";
import { ResearchActionsMenu } from "@/features/rag/research/components/ResearchActionsMenu";
import { ResearchModal } from "@/features/rag/research/components/ResearchModal";
import { GenerateReportModal } from "@/features/rag/workflows/components/GenerateReportModal";
import { StatCard } from "@/features/rag/shared/components/StatCard";
import { ResearchDocumentsClient } from "@/features/rag/research/components/ResearchDocumentsClient";
import { ResearchRunsClient } from "@/features/rag/research/components/ResearchRunsClient";
import type { ResearchSubject } from "@/features/rag/research/types";
import type { RAGDocument } from "@/features/rag/documents/document-types";
import type { Run } from "@/features/rag/runs/types";

type DocumentWithKB = RAGDocument & { 
  knowledge_base_name?: string | null;
};

type RunWithExtras = Run & { 
  knowledge_base_name?: string | null;
  workflow_name?: string | null;
  workflow_label?: string | null;
};

type ResearchDetailClientProps = {
  research: ResearchSubject;
  initialDocuments: DocumentWithKB[];
  initialRuns: RunWithExtras[];
};

export function ResearchDetailClient({
  research: initialResearch,
  initialDocuments,
  initialRuns,
}: ResearchDetailClientProps) {
  const [research, setResearch] = useState(initialResearch);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);

  const handleEdit = () => {
    setIsEditModalOpen(true);
  };

  const handleEditSuccess = (updatedResearch: ResearchSubject) => {
    setResearch(updatedResearch);
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

  return (
    <>
      <div className="w-full space-y-6">
        <div className="flex items-start justify-between gap-4 mb-6 md:mb-8">
          <div>
            <p className="text-sm text-muted-foreground mb-2">Research subject details and statistics.</p>
            <div className="flex items-center gap-2 flex-wrap">
              {research.category && (
                <Badge variant="secondary" className="text-xs">
                  {research.category}
                </Badge>
              )}
              {research.geography && (
                <Badge variant="outline" className="text-xs">
                  {research.geography}
                </Badge>
              )}
              {research.type && (
                <Badge variant="outline" className="text-xs">
                  {research.type}
                </Badge>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setIsGenerateModalOpen(true)}
              className="relative h-10 w-10 p-0 overflow-hidden border-0 shadow-none transition-all duration-300 hover:scale-105 bg-accent hover:bg-accent text-foreground"
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 5px 6px -2px hsl(var(--accent) / 0.1), 0 3px 3px -2px hsl(var(--accent) / 0.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 3px 5px -2px hsl(var(--accent) / 0.0), 0 4px 6px -2px hsl(var(--accent) / 0.0)';
              }}
              title="Generate Report"
            >
              {/* Animated shimmer effect */}
              <div 
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full" 
                style={{
                  animation: 'shimmer 8s infinite'
                }}
              />
              <FontAwesomeIcon 
                icon={faWandMagicSparkles} 
                className="relative z-10 !h-5 !w-5 drop-shadow-lg text-foreground" 
                style={{ fontSize: '20px', width: '20px', height: '20px' }} 
              />
            </Button>
            <ResearchActionsMenu
              research={research}
              onEdit={handleEdit}
            />
          </div>
        </div>

        {/* Stats Grid */}
        <section className="relative">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              title="Total Runs"
              value={research.run_count || 0}
              icon={faPlay}
              index={0}
            />
            <StatCard
              title="First Researched"
              value={formatDate(research.first_researched_at)}
              icon={faCalendar}
              index={1}
            />
            <StatCard
              title="Last Researched"
              value={formatDate(research.last_researched_at)}
              icon={faClock}
              index={2}
            />
          </div>
        </section>

        {/* Runs */}
        <section className="relative">
          <ResearchRunsClient
            initialRuns={initialRuns}
            researchSubjectId={research.id}
          />
        </section>

        {/* Documents */}
        <section className="relative">
          <ResearchDocumentsClient
            initialDocuments={initialDocuments}
            researchSubjectId={research.id}
            researchSubjectName={research.name}
            researchSubjectType={research.type}
          />
        </section>
      </div>

      <ResearchModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        initialData={research}
        onSuccess={handleEditSuccess}
      />

      <GenerateReportModal
        open={isGenerateModalOpen}
        onOpenChange={setIsGenerateModalOpen}
        subjectType={research.type}
        researchSubjectId={research.id}
        researchSubjectName={research.name}
        researchSubjectGeography={research.geography}
        researchSubjectDescription={research.description}
        researchSubjectCategory={research.category}
      />
    </>
  );
}


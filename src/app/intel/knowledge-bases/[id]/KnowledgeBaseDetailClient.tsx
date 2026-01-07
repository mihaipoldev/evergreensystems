"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFileText,
  faLayerGroup,
  faPlay,
  faSpinner,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";
import { KnowledgeBaseActionsMenu } from "@/features/rag/knowledge-bases/components/KnowledgeBaseActionsMenu";
import { KnowledgeBaseModal } from "@/features/rag/knowledge-bases/components/KnowledgeBaseModal";
import { KnowledgeBaseDocumentsClient } from "./KnowledgeBaseDocumentsClient";
import { StatCard } from "@/features/rag/shared/components/StatCard";
import type { KnowledgeBase } from "@/features/rag/knowledge-bases/types";
import type { RAGDocument } from "@/features/rag/documents/document-types";
import type { KnowledgeBaseStats } from "@/features/rag/knowledge-bases/data";

type KnowledgeBaseDetailClientProps = {
  knowledge: KnowledgeBase;
  initialDocuments: RAGDocument[];
  initialStats: KnowledgeBaseStats;
};

export function KnowledgeBaseDetailClient({
  knowledge: initialKnowledge,
  initialDocuments,
  initialStats,
}: KnowledgeBaseDetailClientProps) {
  const [knowledge, setKnowledge] = useState(initialKnowledge);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleEdit = (knowledgeBase: KnowledgeBase) => {
    setKnowledge(knowledgeBase);
    setIsEditModalOpen(true);
  };

  const handleEditSuccess = (updatedKnowledgeBase: KnowledgeBase) => {
    setKnowledge(updatedKnowledgeBase);
    setIsEditModalOpen(false);
  };

  return (
    <>
      <div className="w-full space-y-6">
        <div className="flex items-start justify-between gap-4 mb-6 md:mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">{knowledge.name}</h1>
            <p className="text-sm text-muted-foreground mb-2">Manage documents for this knowledge base.</p>
            <div className="flex items-center gap-2 flex-wrap">
              {knowledge.kb_type && (
                <Badge variant="outline" className="text-xs">
                  {knowledge.kb_type}
                </Badge>
              )}
              <Badge
                variant={knowledge.visibility === "public" ? "default" : "outline"}
                className="text-xs"
              >
                {knowledge.visibility === "public" ? "Public" : "Private"}
              </Badge>
              <Badge
                variant={knowledge.is_active ? "default" : "secondary"}
                className="text-xs"
              >
                {knowledge.is_active ? "Active" : "Inactive"}
              </Badge>
            </div>
          </div>
          <KnowledgeBaseActionsMenu
            knowledgeBase={knowledge}
            knowledgeBaseName={knowledge.name}
            onEdit={handleEdit}
          />
        </div>

        {/* Stats Grid */}
        <section className="relative">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard
              title="Total Documents"
              value={initialStats.totalDocuments}
              icon={faFileText}
              index={0}
            />
            <StatCard
              title="Total Chunks"
              value={initialStats.totalChunks}
              icon={faLayerGroup}
              index={1}
            />
            <StatCard
              title="Total Runs"
              value={initialStats.totalRuns}
              icon={faPlay}
              index={2}
            />
          </div>
        </section>

        {/* Additional Status Cards */}
        {(initialStats.processingDocuments > 0 || initialStats.failedDocuments > 0) && (
          <section className="relative">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {initialStats.processingDocuments > 0 && (
                <StatCard
                  title="Processing"
                  value={initialStats.processingDocuments}
                  icon={faSpinner}
                  index={3}
                />
              )}
              {initialStats.failedDocuments > 0 && (
                <StatCard
                  title="Failed"
                  value={initialStats.failedDocuments}
                  icon={faExclamationTriangle}
                  changeType="negative"
                  index={4}
                />
              )}
            </div>
          </section>
        )}

        <KnowledgeBaseDocumentsClient
          initialDocuments={initialDocuments}
          knowledgeBaseId={knowledge.id}
          knowledgeBaseName={knowledge.name}
        />
      </div>

      <KnowledgeBaseModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        initialData={knowledge}
        onSuccess={handleEditSuccess}
      />
    </>
  );
}


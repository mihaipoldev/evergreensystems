"use client";

import { TooltipProvider } from "@/components/ui/tooltip";
import { DocumentCard } from "./DocumentCard";
import type { RAGDocument } from "../document-types";
import { AnimatedGrid } from "@/features/rag/shared/components/AnimatedGrid";

interface DocumentGridProps {
  documents: RAGDocument[];
  knowledgeBaseName?: string;
  hideKnowledgeBase?: boolean;
  onView?: (document: RAGDocument) => void;
  onDownload?: (document: RAGDocument) => void;
  onDelete?: (document: RAGDocument) => void;
}

export function DocumentGrid({
  documents,
  knowledgeBaseName,
  hideKnowledgeBase = false,
  onView,
  onDownload,
  onDelete,
}: DocumentGridProps) {
  return (
    <TooltipProvider delayDuration={100}>
      <AnimatedGrid
        getKey={(_, index) => documents[index]?.id || index}
        staggerDelay={0.04}
      >
        {documents.map((doc) => {
          const docWithKB = doc as RAGDocument & { 
            knowledge_base_name?: string | null;
            is_workspace_document?: boolean;
          };
          return (
            <div key={doc.id} className="group transform transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1">
              <DocumentCard
                document={doc}
                knowledgeBaseName={hideKnowledgeBase && !docWithKB.knowledge_base_name ? undefined : (docWithKB.knowledge_base_name || knowledgeBaseName)}
                onView={onView ? () => onView(doc) : undefined}
                onDownload={onDownload ? () => onDownload(doc) : undefined}
                onDelete={onDelete ? () => onDelete(doc) : undefined}
              />
            </div>
          );
        })}
      </AnimatedGrid>
    </TooltipProvider>
  );
}


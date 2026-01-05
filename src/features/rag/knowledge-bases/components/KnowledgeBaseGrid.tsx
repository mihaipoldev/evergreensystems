"use client";

import { KnowledgeBaseCard } from "./KnowledgeBaseCard";
import type { KnowledgeBase } from "../types";
import { TooltipProvider } from "@/components/ui/tooltip";

type KnowledgeBaseWithCount = KnowledgeBase & { document_count?: number };

interface KnowledgeBaseGridProps {
  knowledgeBases: KnowledgeBaseWithCount[];
  onDelete?: () => void;
  onEdit?: (knowledgeBase: KnowledgeBase) => void;
}

export function KnowledgeBaseGrid({
  knowledgeBases,
  onDelete,
  onEdit,
}: KnowledgeBaseGridProps) {
  return (
    <TooltipProvider delayDuration={100}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
        {knowledgeBases.map((kb) => (
          <KnowledgeBaseCard
            key={kb.id}
            knowledge={kb}
            documentCount={kb.document_count || 0}
            onDelete={onDelete}
            onEdit={onEdit}
          />
        ))}
      </div>
    </TooltipProvider>
  );
}


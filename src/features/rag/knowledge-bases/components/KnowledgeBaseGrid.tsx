"use client";

import { KnowledgeBaseCard } from "./KnowledgeBaseCard";
import type { KnowledgeBase } from "../types";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AnimatedGrid } from "@/features/rag/shared/components/AnimatedGrid";

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
      <AnimatedGrid
        getKey={(_, index) => knowledgeBases[index]?.id || index}
        staggerDelay={0.04}
      >
        {knowledgeBases.map((kb) => (
          <div key={kb.id} className="group transform transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1">
            <KnowledgeBaseCard
              knowledge={kb}
              documentCount={kb.document_count || 0}
              onDelete={onDelete}
              onEdit={onEdit}
            />
          </div>
        ))}
      </AnimatedGrid>
    </TooltipProvider>
  );
}


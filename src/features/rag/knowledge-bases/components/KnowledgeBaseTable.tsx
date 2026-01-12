"use client";

import { Card } from "@/components/ui/card";
import { TooltipProvider } from "@/components/ui/tooltip";
import { KnowledgeBaseRow } from "./KnowledgeBaseRow";
import type { KnowledgeBase } from "../types";
import { AnimatedTable } from "@/features/rag/shared/components/AnimatedTable";

type KnowledgeBaseWithCount = KnowledgeBase & { document_count?: number };

interface KnowledgeBaseTableProps {
  knowledgeBases: KnowledgeBaseWithCount[];
  onDelete?: () => void;
  onEdit?: (knowledgeBase: KnowledgeBase) => void;
}

export function KnowledgeBaseTable({
  knowledgeBases,
  onDelete,
  onEdit,
}: KnowledgeBaseTableProps) {
  return (
    <TooltipProvider delayDuration={100}>
      <div className="space-y-3">
        {/* Table Header */}
        <div className="hidden md:flex items-center gap-4 px-4 py-3 bg-muted/50 rounded-lg text-xs font-medium text-muted-foreground uppercase tracking-wider">
          <div className="flex-1 min-w-0">Name</div>
          <div className="w-24 shrink-0">Type</div>
          <div className="w-20 shrink-0">Docs</div>
          <div className="w-20 shrink-0">Size</div>
          <div className="w-28 shrink-0">Updated</div>
          <div className="w-20 shrink-0 text-right">Actions</div>
        </div>

        {/* Animated Rows */}
        <AnimatedTable
          getKey={(_, index) => knowledgeBases[index]?.id || index}
          staggerDelay={0.02}
        >
          {knowledgeBases.map((kb) => (
            <KnowledgeBaseRow
              key={kb.id}
              knowledge={kb}
              documentCount={kb.document_count || 0}
              onDelete={onDelete}
              onEdit={onEdit}
            />
          ))}
        </AnimatedTable>
      </div>
    </TooltipProvider>
  );
}


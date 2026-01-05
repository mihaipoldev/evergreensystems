"use client";

import { Card } from "@/components/ui/card";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DocumentRow } from "./DocumentRow";
import type { RAGDocument } from "../document-types";

interface DocumentTableProps {
  documents: RAGDocument[];
  knowledgeBaseName?: string;
  onView?: (document: RAGDocument) => void;
  onDownload?: (document: RAGDocument) => void;
  onDelete?: (document: RAGDocument) => void;
}

export function DocumentTable({
  documents,
  knowledgeBaseName,
  onView,
  onDownload,
  onDelete,
}: DocumentTableProps) {
  return (
    <TooltipProvider delayDuration={100}>
      <div className="space-y-2">
      {/* Table Header */}
      <div className="flex items-center gap-4 px-4 py-3 bg-muted/50 rounded-lg text-xs font-medium text-muted-foreground uppercase tracking-wider">
        <div className="flex-1 min-w-0">Name</div>
        <div className="w-20 shrink-0">Size</div>
        <div className="w-24 shrink-0">Status</div>
        <div className="w-32 shrink-0">Knowledge Base</div>
        <div className="w-28 shrink-0">Uploaded</div>
        <div className="w-20 shrink-0 text-right">Actions</div>
      </div>

      {/* Rows */}
      {documents.map((doc) => {
        const docWithKB = doc as RAGDocument & { knowledge_base_name?: string | null };
        return (
          <DocumentRow
            key={doc.id}
            document={doc}
            knowledgeBaseName={docWithKB.knowledge_base_name || knowledgeBaseName}
            onView={onView ? () => onView(doc) : undefined}
            onDownload={onDownload ? () => onDownload(doc) : undefined}
            onDelete={onDelete ? () => onDelete(doc) : undefined}
          />
        );
      })}
      </div>
    </TooltipProvider>
  );
}


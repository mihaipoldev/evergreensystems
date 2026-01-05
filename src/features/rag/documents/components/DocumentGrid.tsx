"use client";

import { DocumentCard } from "./DocumentCard";
import type { RAGDocument } from "../document-types";

interface DocumentGridProps {
  documents: RAGDocument[];
  knowledgeBaseName?: string;
  onView?: (document: RAGDocument) => void;
  onDownload?: (document: RAGDocument) => void;
  onDelete?: (document: RAGDocument) => void;
}

export function DocumentGrid({
  documents,
  knowledgeBaseName,
  onView,
  onDownload,
  onDelete,
}: DocumentGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
      {documents.map((doc) => {
        const docWithKB = doc as RAGDocument & { knowledge_base_name?: string | null };
        return (
          <DocumentCard
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
  );
}


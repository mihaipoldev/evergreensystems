"use client";

import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileText } from "@fortawesome/free-solid-svg-icons";
import { StatusBadge } from "@/features/rag/shared/components/StatusBadge";
import { statusColorMap } from "@/features/rag/shared/config/statusColors";
import type { RAGDocument } from "../document-types";

type DocumentCardCompactProps = {
  document: RAGDocument;
};

export function DocumentCardCompact({
  document,
}: DocumentCardCompactProps) {
  // Map status to color using the shared config
  function getStatusColor(status: string): string {
    return statusColorMap[status] || "muted";
  }

  const statusColor = getStatusColor(document.status);

  const getFileTypeLabel = (): string => {
    if (document.file_type) {
      return document.file_type.toUpperCase();
    }
    if (document.mime_type) {
      const parts = document.mime_type.split("/");
      return parts[parts.length - 1].toUpperCase();
    }
    return "FILE";
  };

  return (
    <Card className="h-full border-0">
      <CardHeader className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
            <FontAwesomeIcon
              icon={faFileText}
              className="h-4 w-4 text-primary"
            />
          </div>
          <h3 className="font-medium text-foreground truncate min-w-0 flex-1">
            {document.title || "Untitled Document"}
          </h3>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-2">
        <StatusBadge 
          color={statusColor}
        >
          {document.status}
        </StatusBadge>
        <div className="text-sm text-muted-foreground">
          <span>{getFileTypeLabel()}</span>
        </div>
      </CardContent>
    </Card>
  );
}


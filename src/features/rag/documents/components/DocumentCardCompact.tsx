"use client";

import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileText } from "@fortawesome/free-solid-svg-icons";
import type { RAGDocument } from "../document-types";
import { cn } from "@/lib/utils";

type DocumentCardCompactProps = {
  document: RAGDocument;
};

export function DocumentCardCompact({
  document,
}: DocumentCardCompactProps) {
  const statusColors: Record<string, string> = {
    ready: "bg-green-600/10 text-green-600 dark:text-green-400",
    processing: "bg-yellow-600/10 text-yellow-600 dark:text-yellow-400",
    failed: "bg-destructive/10 text-destructive",
  };

  const statusColorClass = statusColors[document.status] || statusColors.ready;

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
          <h3 className="font-medium text-foreground truncate">
            {document.title || "Untitled Document"}
          </h3>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-2">
        <Badge variant="secondary" className={cn("w-fit capitalize", statusColorClass)}>
          {document.status}
        </Badge>
        <div className="text-sm text-muted-foreground">
          <span>{getFileTypeLabel()}</span>
        </div>
      </CardContent>
    </Card>
  );
}


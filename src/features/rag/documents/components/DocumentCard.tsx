"use client";

import Link from "next/link";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFileText,
  faClock,
} from "@fortawesome/free-solid-svg-icons";
import { DocumentActionsMenu } from "./DocumentActionsMenu";
import type { RAGDocument } from "../document-types";
import { cn } from "@/lib/utils";

type DocumentCardProps = {
  document: RAGDocument;
  knowledgeBaseName?: string;
  onView?: () => void;
  onDownload?: () => void;
  onDelete?: () => void;
};

export function DocumentCard({
  document,
  knowledgeBaseName,
  onView,
  onDownload,
  onDelete,
}: DocumentCardProps) {
  const formattedDate = new Date(document.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const fileSize = document.file_size
    ? `${(document.file_size / 1024 / 1024).toFixed(2)} MB`
    : "0 MB";

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
    <Card className="flex flex-col h-full border-none shadow-card-light hover:shadow-card hover:bg-accent/20 transition-all duration-300 overflow-hidden">
      {/* Header */}
      <CardHeader className="flex-row items-center justify-between gap-3 space-y-0 p-4 py-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 shadow-icon">
            <FontAwesomeIcon
              icon={faFileText}
              className="h-4 w-4 text-primary"
            />
          </div>
          <h3 className="font-bold text-foreground truncate">
            {document.title || "Untitled Document"}
          </h3>
        </div>
        <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
          <DocumentActionsMenu
            document={document}
            onView={onView}
            onDownload={onDownload}
            onDelete={onDelete}
          />
        </div>
      </CardHeader>

      {/* Body */}
      <CardContent className="flex-1 p-4 pt-1 space-y-3">
        <Badge variant="secondary" className={cn("w-fit", statusColorClass)}>
          {document.status}
        </Badge>
        <div className="text-sm text-muted-foreground">
          <p>{getFileTypeLabel()}</p>
        </div>
        {knowledgeBaseName && (
          <div className="text-sm text-muted-foreground">
            <span>KB: {knowledgeBaseName}</span>
          </div>
        )}
        <div className="text-sm text-muted-foreground">
          <span>{fileSize}</span>
        </div>
      </CardContent>

      {/* Footer */}
      <CardFooter className="flex items-center p-4 bg-muted/50">
        <div className="flex items-center h-6 gap-1.5 text-xs text-muted-foreground">
          <FontAwesomeIcon icon={faClock} className="h-3.5 w-3.5" />
          <span>{formattedDate}</span>
        </div>
      </CardFooter>
    </Card>
  );
}

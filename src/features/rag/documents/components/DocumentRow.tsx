"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFileText,
} from "@fortawesome/free-solid-svg-icons";
import { DocumentActionsMenu } from "./DocumentActionsMenu";
import type { RAGDocument } from "../document-types";
import { cn } from "@/lib/utils";

type DocumentRowProps = {
  document: RAGDocument;
  knowledgeBaseName?: string;
  onView?: () => void;
  onDownload?: () => void;
  onDelete?: () => void;
};

export function DocumentRow({
  document,
  knowledgeBaseName,
  onView,
  onDownload,
  onDelete,
}: DocumentRowProps) {
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
    <Card className="flex items-center gap-4 p-4 border-none shadow-card-light hover:shadow-card transition-shadow h-20">
      {/* Icon + Name */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="h-9 w-9 rounded-lg bg-accent flex items-center justify-center shrink-0">
          <FontAwesomeIcon
            icon={faFileText}
            className="h-4 w-4 text-primary"
          />
        </div>
        <div className="min-w-0 flex flex-col h-full justify-center">
          <Tooltip>
            <TooltipTrigger asChild>
              <p className="font-medium text-foreground truncate">
                {document.title || "Untitled Document"}
              </p>
            </TooltipTrigger>
            <TooltipContent>
              <p>{document.title || "Untitled Document"}</p>
            </TooltipContent>
          </Tooltip>
          <p className="text-xs text-muted-foreground mt-0.5">{getFileTypeLabel()}</p>
        </div>
      </div>

      {/* Size */}
      <div className="w-20 shrink-0">
        <p className="text-sm text-muted-foreground">{fileSize}</p>
      </div>

      {/* Status */}
      <div className="w-24 shrink-0">
        <Badge variant="secondary" className={cn("w-fit capitalize", statusColorClass)}>
          {document.status}
        </Badge>
      </div>

      {/* Knowledge Base */}
      <div className="w-32 shrink-0">
        <p className="text-sm text-muted-foreground truncate">
          {knowledgeBaseName || "—"}
        </p>
      </div>

      {/* Uploaded */}
      <div className="w-28 shrink-0">
        <p className="text-sm text-muted-foreground">{formattedDate}</p>
      </div>

      {/* Actions */}
      <div className="w-20 shrink-0 flex items-center justify-end">
        <div onClick={(e) => e.stopPropagation()}>
          <DocumentActionsMenu
            document={document}
            onView={onView}
            onDownload={onDownload}
            onDelete={onDelete}
          />
        </div>
      </div>
    </Card>
  );
}


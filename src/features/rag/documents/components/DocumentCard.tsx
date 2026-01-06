"use client";

import Link from "next/link";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFileText,
  faClock,
} from "@fortawesome/free-solid-svg-icons";
import { DocumentActionsMenu } from "./DocumentActionsMenu";
import type { RAGDocument } from "../document-types";
import { cn } from "@/lib/utils";

type DocumentCardProps = {
  document: RAGDocument & { 
    knowledge_base_name?: string | null;
    is_workspace_document?: boolean;
  };
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

  const getFileTypeLabel = () => {
    // Format source type nicely
    const formatSourceType = (sourceType: string | null | undefined): string => {
      if (!sourceType) return "Unknown";
      return sourceType
        .split("_")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(" ");
    };

    // Get file type
    let fileType: string | null = null;
    if (document.file_type) {
      fileType = document.file_type.toUpperCase();
    } else if (document.mime_type) {
      const parts = document.mime_type.split("/");
      fileType = parts[parts.length - 1].toUpperCase();
    }

    // Get source type
    const sourceType = formatSourceType(document.source_type);

    // Build base label: Source Type • File Type (or just Source Type if no file type)
    let baseLabel = sourceType;
    if (fileType) {
      baseLabel = `${sourceType} • ${fileType}`;
    }

    // Add chunk count if should_chunk is true
    const showChunks = document.should_chunk && document.chunk_count > 0;

    return (
      <span className="flex items-center gap-1.5">
        <span>{baseLabel}</span>
        {showChunks && (
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
            <span>{document.chunk_count} chunks</span>
          </span>
        )}
      </span>
    );
  };

  return (
    <Card className="relative flex flex-col h-full border-none shadow-card-light hover:shadow-card hover:bg-card/70 transition-all duration-300 overflow-hidden">
      {/* Corner Indicator */}
      {document.is_workspace_document !== undefined && (
        <Tooltip>
          <TooltipTrigger asChild>
            <div 
              className={cn(
                "absolute top-0 right-0 w-0 h-0 border-t-[24px] border-r-[24px] border-t-transparent z-10 cursor-help",
                document.is_workspace_document 
                  ? "border-r-primary" 
                  : "border-r-muted-foreground/30"
              )}
              aria-label={document.is_workspace_document ? "Workspace document" : "Linked document"}
            />
          </TooltipTrigger>
          <TooltipContent>
            <p>{document.is_workspace_document ? "Workspace Document" : "Linked Document"}</p>
          </TooltipContent>
        </Tooltip>
      )}
      
      {/* Header */}
      <CardHeader className="flex-row items-center justify-between gap-3 space-y-0 p-4 py-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className={cn(
            "h-9 w-9 rounded-lg flex items-center justify-center shrink-0 shadow-icon",
            document.is_workspace_document === true
              ? "bg-primary/10"
              : document.is_workspace_document === false
              ? "bg-muted/50"
              : "bg-primary/10"
          )}>
            <FontAwesomeIcon
              icon={faFileText}
              className={cn(
                "h-4 w-4",
                document.is_workspace_document === true
                  ? "text-primary"
                  : document.is_workspace_document === false
                  ? "text-muted-foreground"
                  : "text-primary"
              )}
            />
          </div>
          <h3 className="font-bold text-foreground truncate">
            {document.title || "Untitled Document"}
          </h3>
        </div>
        <div className="shrink-0 relative z-20" onClick={(e) => e.stopPropagation()}>
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
          {getFileTypeLabel()}
        </div>
        {(document.knowledge_base_name || knowledgeBaseName) && (
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">KB: </span>
            <span>{document.knowledge_base_name || knowledgeBaseName}</span>
          </div>
        )}
        <div className="text-sm text-muted-foreground">
          <span>{fileSize}</span>
        </div>
      </CardContent>

      {/* Footer */}
      <CardFooter className="flex items-center p-4 bg-muted/50">
        <div className="flex items-center h-2 gap-1.5 text-xs text-muted-foreground">
          <FontAwesomeIcon icon={faClock} className="h-3.5 w-3.5" />
          <span>{formattedDate}</span>
        </div>
      </CardFooter>
    </Card>
  );
}

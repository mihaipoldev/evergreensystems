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
  document: RAGDocument & { 
    knowledge_base_name?: string | null;
    is_workspace_document?: boolean;
  };
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
    <Card className="relative flex items-center gap-4 p-4 border-none shadow-card-light hover:shadow-card transition-shadow h-20 overflow-hidden">
      {/* Corner Indicator */}
      {document.is_workspace_document !== undefined && (
        <Tooltip>
          <TooltipTrigger asChild>
            <div 
              className={cn(
                "absolute top-0 right-0 w-0 h-0 border-t-[20px] border-r-[20px] border-t-transparent cursor-help",
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
      
      {/* Icon + Name */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className={cn(
          "h-9 w-9 rounded-lg flex items-center justify-center shrink-0",
          document.is_workspace_document === true
            ? "bg-primary/10"
            : document.is_workspace_document === false
            ? "bg-muted/50"
            : "bg-secondary"
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
          <div className="text-xs text-muted-foreground mt-0.5">{getFileTypeLabel()}</div>
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
      {(document.knowledge_base_name || knowledgeBaseName) && (
        <div className="w-32 shrink-0">
          <p className="text-sm text-muted-foreground truncate">
            {document.knowledge_base_name || knowledgeBaseName}
          </p>
        </div>
      )}

      {/* Uploaded */}
      <div className="w-28 shrink-0">
        <p className="text-sm text-muted-foreground">{formattedDate}</p>
      </div>

      {/* Actions */}
      <div className="w-20 shrink-0 flex items-center justify-end relative z-20">
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


"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ActionMenu } from "@/components/admin/ActionMenu";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFile, faTrash, faExternalLinkAlt, faEye, faDownload } from "@fortawesome/free-solid-svg-icons";
import ReactMarkdown from "react-markdown";
import Image from "next/image";
import { toast } from "sonner";
import type { RAGDocument } from "../document-types";

type DocumentCardProps = {
  document: RAGDocument;
  onRemove: (id: string) => Promise<void>;
};

export function DocumentCard({ document, onRemove }: DocumentCardProps) {
  const [isMarkdownModalOpen, setIsMarkdownModalOpen] = useState(false);
  const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  const formattedDate = new Date(document.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "ready":
        return "default";
      case "processing":
        return "secondary";
      case "failed":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getSourceTypeLabel = (sourceType: string) => {
    switch (sourceType) {
      case "notion":
        return "Notion";
      case "gdrive":
        return "Google Drive";
      case "upload":
        return "Upload";
      case "url":
        return "URL";
      default:
        return sourceType;
    }
  };

  // Get first ~120 characters of content for preview
  const contentSnippet = document.content
    ? document.content.substring(0, 120) + (document.content.length > 120 ? "..." : "")
    : null;

  // Check if document is pasted text (no storage_path)
  const isPastedText = !document.storage_path || document.storage_path.trim() === "";

  // Detect file type
  const getFileType = (): "image" | "pdf" | "other" => {
    if (isPastedText) return "other";
    
    const contentType = document.content_type?.toLowerCase() || "";
    const title = document.title?.toLowerCase() || "";
    const storagePath = document.storage_path?.toLowerCase() || "";

    // Check MIME type
    if (contentType.startsWith("image/")) return "image";
    if (contentType === "application/pdf") return "pdf";

    // Check file extension
    const extension = title.split(".").pop() || storagePath.split(".").pop() || "";
    const imageExtensions = ["jpg", "jpeg", "png", "gif", "webp", "svg"];
    if (imageExtensions.includes(extension)) return "image";
    if (extension === "pdf") return "pdf";

    return "other";
  };

  // Handle Open action
  const handleOpen = async () => {
    if (isPastedText) {
      // Open markdown modal for pasted text
      setIsMarkdownModalOpen(true);
    } else {
      try {
        // Get CDN URL from server
        const response = await fetch(`/api/admin/ai-knowledge/documents/${document.id}/url`);
        if (!response.ok) {
          throw new Error("Failed to get document URL");
        }
        const data = await response.json();
        
        if (!data.url) {
          toast.error("Cannot open: URL not available");
          return;
        }

        const fileType = getFileType();

        if (fileType === "image") {
          // Open image in modal
          setPreviewImageUrl(data.url);
          setIsImagePreviewOpen(true);
        } else {
          // Open PDF and other files in new tab
          window.open(data.url, "_blank", "noopener,noreferrer");
        }
      } catch (error: any) {
        console.error("Error opening document:", error);
        toast.error(error.message || "Failed to open document");
      }
    }
  };

  // Handle Download action
  const handleDownload = async () => {
    try {
      toast.loading("Downloading...", { id: "download" });

      // Use server-side download endpoint
      const response = await fetch(`/api/admin/ai-knowledge/documents/${document.id}/download`);
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: "Failed to download" }));
        throw new Error(error.error || "Failed to download file");
      }

      // Get filename from Content-Disposition header or use default
      const contentDisposition = response.headers.get("Content-Disposition");
      let filename = document.title || "document";
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+?)"?$/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      // Get file as blob
      const blob = await response.blob();
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const a = window.document.createElement("a");
      a.href = url;
      a.download = filename;
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success("File downloaded", { id: "download" });
    } catch (error: any) {
      console.error("Error downloading file:", error);
      toast.error(error.message || "Failed to download file", { id: "download" });
    }
  };

  return (
    <React.Fragment>
      <div className="group relative rounded-xl bg-card/50 border border-border/40 p-6 transition-all hover:bg-card hover:border-border/60 hover:shadow-md flex flex-col">
        {/* Action menu - subtle icon in top right */}
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <ActionMenu
            itemId={document.id}
            onDelete={onRemove}
            deleteLabel="this document"
            customActions={[
              {
                label: "Open",
                icon: <FontAwesomeIcon icon={faEye} className="h-4 w-4" />,
                onClick: handleOpen,
              },
              {
                label: "Download",
                icon: <FontAwesomeIcon icon={faDownload} className="h-4 w-4" />,
                onClick: handleDownload,
              },
            ]}
          />
        </div>

        <div className="flex items-start gap-3 mb-4">
        <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-primary/10 flex-shrink-0">
          <FontAwesomeIcon icon={faFile} className="h-5 w-5 text-primary" />
        </div>
        
        <div className="flex-1 min-w-0 pr-8">
          <h3 className="text-base font-semibold text-foreground leading-snug mb-2 line-clamp-2">
            {document.title || "Untitled document"}
          </h3>
          
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="text-xs">
              {getSourceTypeLabel(document.source_type)}
            </Badge>
            <Badge variant={getStatusVariant(document.status)} className="text-xs">
              {document.status}
            </Badge>
          </div>
        </div>
      </div>

        {contentSnippet && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
            {contentSnippet}
          </p>
        )}

        <div className="mt-auto pt-4 border-t border-border/30 space-y-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{formattedDate}</span>
            <div className="flex items-center gap-3">
              <span>{document.chunk_count} chunks</span>
              <span>•</span>
              <span>{document.embedding_count} embeddings</span>
            </div>
          </div>

          {document.source_url && (
            <Button
              variant="secondary"
              size="sm"
              className="w-full"
              onClick={() => window.open(document.source_url!, "_blank")}
            >
              <FontAwesomeIcon icon={faExternalLinkAlt} className="h-3 w-3 mr-2" />
              Open Source
            </Button>
          )}
        </div>
      </div>

      {/* Markdown Preview Modal */}
      <Dialog open={isMarkdownModalOpen} onOpenChange={setIsMarkdownModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>{document.title || "Document Preview"}</DialogTitle>
            <DialogDescription>Markdown content</DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto min-h-0 px-6 pb-6">
            <div className="markdown-content text-sm space-y-4">
              <ReactMarkdown
                components={{
                  h1: ({ children }) => <h1 className="text-2xl font-bold mb-4 mt-6">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-xl font-bold mb-3 mt-5">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-lg font-semibold mb-2 mt-4">{children}</h3>,
                  p: ({ children }) => <p className="mb-3 leading-relaxed">{children}</p>,
                  ul: ({ children }) => <ul className="list-disc list-inside mb-3 space-y-1">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal list-inside mb-3 space-y-1">{children}</ol>,
                  li: ({ children }) => <li className="ml-2">{children}</li>,
                  code: ({ children }) => (
                    <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">{children}</code>
                  ),
                  pre: ({ children }) => (
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto mb-3">
                      {children}
                    </pre>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-primary pl-4 italic my-3">{children}</blockquote>
                  ),
                  a: ({ href, children }) => (
                    <a href={href} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                      {children}
                    </a>
                  ),
                }}
              >
                {document.content || ""}
              </ReactMarkdown>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Preview Modal */}
      <Dialog open={isImagePreviewOpen} onOpenChange={setIsImagePreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0">
          <DialogHeader className="flex-shrink-0 px-6 mt-6 pt-6 pb-4">
            <DialogTitle>{document.title || "Image Preview"}</DialogTitle>
            <DialogDescription>Image preview</DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto min-h-0 px-6 pb-6">
            {previewImageUrl && (
              <div className="w-full bg-muted rounded-lg overflow-hidden">
                <Image
                  src={previewImageUrl}
                  alt={document.title || "Preview"}
                  width={1200}
                  height={800}
                  className="w-full h-auto object-contain"
                  unoptimized
                />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </React.Fragment>
  );
}


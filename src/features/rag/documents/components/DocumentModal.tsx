"use client";

import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUpload,
  faFileText,
  faLink,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import {
  RAGInput,
  RAGTextarea,
  RAGSelect,
  RAGSelectTrigger,
  RAGSelectContent,
  RAGSelectItem,
  RAGSelectValue,
  RAGModal,
  LockedInput,
} from "@/features/rag/shared/components";
import { uploadDocument, linkDocumentsToProject } from "../document-api";
import { cn } from "@/lib/utils";
import type { RAGDocument } from "../document-types";
import { LinkDocumentsList } from "./LinkDocumentsList";

type DocumentModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  knowledgeBaseId?: string;
  knowledgeBaseName?: string;
  projectId?: string; // New: required when sourceType is "link"
  onSuccess: (document: RAGDocument) => void;
};

type KnowledgeBase = {
  id: string;
  name: string;
};

export function DocumentModal({
  open,
  onOpenChange,
  knowledgeBaseId,
  knowledgeBaseName,
  projectId,
  onSuccess,
}: DocumentModalProps) {
  const [sourceType, setSourceType] = useState<"file" | "url" | "text" | "link">("file");
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState("");
  const [textContent, setTextContent] = useState("");
  const [shouldChunk, setShouldChunk] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedKBId, setSelectedKBId] = useState<string>(knowledgeBaseId || "");
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([]);
  const [loadingKBs, setLoadingKBs] = useState(false);
  const [selectedDocumentIds, setSelectedDocumentIds] = useState<string[]>([]);
  const [errors, setErrors] = useState<{
    source?: string;
    kb?: string;
  }>({});
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch knowledge bases only if knowledgeBaseId is not provided (when opened from documents page)
  useEffect(() => {
    if (open && !knowledgeBaseId) {
      setLoadingKBs(true);
      fetch("/api/intel/knowledge-base")
        .then((res) => res.json())
        .then((data) => {
          setKnowledgeBases(data || []);
          // Don't pre-select any KB when opened from documents page
        })
        .catch((err) => {
          console.error("Error fetching knowledge bases:", err);
          toast.error("Failed to load knowledge bases");
        })
        .finally(() => {
          setLoadingKBs(false);
        });
    } else if (knowledgeBaseId) {
      setSelectedKBId(knowledgeBaseId);
    }
  }, [open, knowledgeBaseId]);

  // Get the current knowledge base name
  const currentKBName =
    knowledgeBaseName ||
    knowledgeBases.find((kb) => kb.id === selectedKBId)?.name ||
    "";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      validateAndSetFile(selectedFile);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    // Validate file type - only PDF, TXT, MD
    const allowedExtensions = ['.pdf', '.txt', '.md'];
    const fileExtension = '.' + selectedFile.name.split('.').pop()?.toLowerCase();
    
    if (!allowedExtensions.includes(fileExtension)) {
      toast.error(`File type not supported. Allowed types: ${allowedExtensions.join(', ').toUpperCase()}`);
      return;
    }

    // Validate file size (20MB)
    const maxSize = 20 * 1024 * 1024; // 20MB in bytes
    if (selectedFile.size > maxSize) {
      toast.error('File size exceeds 20MB limit');
      return;
    }

    setFile(selectedFile);
    if (errors.source) setErrors({ ...errors, source: undefined });
  };

  const handleRemoveFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (sourceType === "file" && !file) {
      setIsDragging(true);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (sourceType === "file" && !file) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set isDragging to false if we're leaving the drop zone area
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (sourceType !== "file") {
      return;
    }

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles && droppedFiles.length > 0) {
      const droppedFile = droppedFiles[0];
      validateAndSetFile(droppedFile);
    }
  };

  const handleSubmit = async () => {
    console.log("[DEBUG] DocumentModal: handleSubmit called", {
      sourceType,
      hasFile: !!file,
      hasUrl: !!url,
      hasTextContent: !!textContent,
      knowledgeBaseId,
      selectedKBId,
      shouldChunk,
    });

    const newErrors: {
      source?: string;
      kb?: string;
    } = {};

    if (!knowledgeBaseId && !selectedKBId) {
      newErrors.kb = "Please select a knowledge base";
      console.log("[DEBUG] DocumentModal: Validation error - no KB selected");
    }
    if (sourceType === "file" && !file) {
      newErrors.source = "Please select a file to upload";
      console.log("[DEBUG] DocumentModal: Validation error - no file selected");
    }
    if (sourceType === "url" && !url.trim()) {
      newErrors.source = "Please enter a valid URL";
      console.log("[DEBUG] DocumentModal: Validation error - no URL entered");
    }
    if (sourceType === "text" && !textContent.trim()) {
      newErrors.source = "Please enter some text content";
      console.log("[DEBUG] DocumentModal: Validation error - no text content");
    }
    if (sourceType === "link") {
      if (!projectId) {
        newErrors.source = "Project ID is required for linking documents";
      } else if (selectedDocumentIds.length === 0) {
        newErrors.source = "Please select at least one document to link";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      console.log("[DEBUG] DocumentModal: Validation failed", { newErrors });
      setErrors(newErrors);
      return;
    }

    console.log("[DEBUG] DocumentModal: Starting submit...");
    setIsSubmitting(true);
    try {
      // Handle linking documents
      if (sourceType === "link" && projectId && selectedDocumentIds.length > 0) {
        console.log("[DEBUG] DocumentModal: Linking documents", {
          projectId,
          documentIds: selectedDocumentIds,
        });
        
        const result = await linkDocumentsToProject(projectId, selectedDocumentIds);
        
        if (!result.success) {
          throw new Error(result.error || "Failed to link documents");
        }

        console.log("[DEBUG] DocumentModal: ✅ Link successful");
        toast.success(
          `Successfully linked ${selectedDocumentIds.length} ${selectedDocumentIds.length === 1 ? "document" : "documents"}`
        );
        handleClose();
        // Call onSuccess with a dummy document for compatibility
        // The actual documents will be updated via real-time subscription
        onSuccess({} as RAGDocument);
        return;
      }

      // Handle upload (file, url, text)
      // Use knowledgeBaseId if provided, otherwise use selectedKBId
      const kbId = knowledgeBaseId || selectedKBId;
      console.log("[DEBUG] DocumentModal: Uploading document", {
        kbId,
        sourceType,
        shouldChunk,
        hasFile: !!file,
        fileSize: file?.size,
        fileName: file?.name,
      });
      
      let result;
      if (sourceType === "file" && file) {
        console.log("[DEBUG] DocumentModal: Calling uploadDocument with file");
        result = await uploadDocument({
          knowledge_base_id: kbId,
          source_type: "upload",
          file: file,
          should_chunk: shouldChunk,
        });
      } else if (sourceType === "url" && url.trim()) {
        console.log("[DEBUG] DocumentModal: Calling uploadDocument with URL");
        result = await uploadDocument({
          knowledge_base_id: kbId,
          source_type: "url",
          source_url: url.trim(),
          should_chunk: shouldChunk,
        });
      } else if (sourceType === "text" && textContent.trim()) {
        console.log("[DEBUG] DocumentModal: Calling uploadDocument with text");
        result = await uploadDocument({
          knowledge_base_id: kbId,
          source_type: "text",
          text_content: textContent.trim(),
          content_type: "text/markdown",
          should_chunk: shouldChunk,
        });
      } else {
        throw new Error("Invalid source type or missing data");
      }

      console.log("[DEBUG] DocumentModal: Upload result", { result });

      if (!result.success) {
        throw new Error(result.error || "Failed to upload document");
      }

      if (!result.document) {
        throw new Error("Document was created but not returned");
      }

      console.log("[DEBUG] DocumentModal: ✅ Upload successful", { documentId: result.document.id });
      toast.success("Document uploaded successfully");
      handleClose();
      onSuccess(result.document);
    } catch (error: any) {
      console.error("[DEBUG] DocumentModal: ❌ Error:", error);
      toast.error(error.message || "Failed to process request");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSourceType("file");
    setFile(null);
    setUrl("");
    setTextContent("");
    setShouldChunk(true);
    setSelectedDocumentIds([]);
    setErrors({});
    setIsDragging(false);
    // Reset selectedKBId only if not provided via prop (when opened from documents page)
    if (!knowledgeBaseId) {
      setSelectedKBId("");
    }
    onOpenChange(false);
  };

  return (
    <RAGModal
      open={open}
      onOpenChange={handleClose}
      title="Add Document"
      footer={
        <>
          <Button
            className="shadow-buttons border-none bg-muted/20 hover:text-foreground hover:bg-muted/30"
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            className="shadow-buttons border-none"
            onClick={handleSubmit}
            disabled={isSubmitting || (sourceType === "link" && selectedDocumentIds.length === 0)}
          >
            {isSubmitting
              ? sourceType === "link"
                ? "Linking..."
                : "Uploading..."
              : sourceType === "link"
              ? "Link Documents"
              : "Upload Document"}
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        {/* Knowledge Base */}
        {knowledgeBaseId ? (
          <LockedInput
            label="Knowledge Base"
            value={currentKBName}
          />
        ) : (
          <div className="space-y-2">
            <Label htmlFor="kb-select">
              Knowledge Base <span className="text-destructive">*</span>
            </Label>
            <RAGSelect
              value={selectedKBId}
              onValueChange={(value) => {
                setSelectedKBId(value);
                if (errors.kb) setErrors({ ...errors, kb: undefined });
              }}
              disabled={loadingKBs}
            >
              <RAGSelectTrigger
                id="kb-select"
                error={!!errors.kb}
              >
                <RAGSelectValue placeholder={loadingKBs ? "Loading..." : "Select knowledge base"} />
              </RAGSelectTrigger>
              <RAGSelectContent>
                {knowledgeBases.map((kb) => (
                  <RAGSelectItem key={kb.id} value={kb.id}>
                    {kb.name}
                  </RAGSelectItem>
                ))}
              </RAGSelectContent>
            </RAGSelect>
            {errors.kb && (
              <p className="text-xs text-destructive">{errors.kb}</p>
            )}
          </div>
        )}

        {/* Source Type */}
        <div className="space-y-3">
          <Label>
            Source Type <span className="text-destructive">*</span>
          </Label>
          <RadioGroup
            value={sourceType}
            onValueChange={(value: "file" | "url" | "text" | "link") => {
              setSourceType(value);
              setIsDragging(false);
              // Clear selected documents when switching away from link
              if (value !== "link") {
                setSelectedDocumentIds([]);
              }
              if (errors.source) setErrors({ ...errors, source: undefined });
            }}
            className="flex gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="file" id="source-file" />
              <Label htmlFor="source-file" className="font-normal cursor-pointer">
                File Upload
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="text" id="source-text" />
              <Label htmlFor="source-text" className="font-normal cursor-pointer">
                Text
              </Label>
            </div>
            {projectId && (
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="link" id="source-link" />
                <Label htmlFor="source-link" className="font-normal cursor-pointer">
                  Link Document
                </Label>
              </div>
            )}
          </RadioGroup>

          {/* File Upload Area */}
          {sourceType === "file" && (
            <div className="space-y-2">
              {!file ? (
                <div
                  className={cn(
                    "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
                    errors.source 
                      ? "border-destructive" 
                      : isDragging
                      ? "border-primary bg-accent/50"
                      : "border-border hover:border-primary hover:bg-accent/50"
                  )}
                  onClick={() => fileInputRef.current?.click()}
                  onDragEnter={handleDragEnter}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <FontAwesomeIcon
                    icon={faUpload}
                    className={cn(
                      "h-8 w-8 mx-auto mb-2 transition-colors",
                      isDragging ? "text-primary" : "text-muted-foreground"
                    )}
                  />
                  <p className="text-sm font-medium">
                    Upload file
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PDF, TXT, MD (max 20MB)
                  </p>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-3 border border-border rounded-lg bg-muted/30">
                  <FontAwesomeIcon
                    icon={faFileText}
                    className="h-8 w-8 text-primary shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0"
                    onClick={handleRemoveFile}
                    type="button"
                  >
                    <FontAwesomeIcon icon={faTimes} className="h-4 w-4" />
                  </Button>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.txt,.md"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          )}

          {/* URL Input */}
          {sourceType === "url" && (
            <div className="space-y-2">
              <div className="relative">
                <FontAwesomeIcon
                  icon={faLink}
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
                />
                <RAGInput
                  placeholder="https://example.com/document.pdf"
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    if (errors.source) setErrors({ ...errors, source: undefined });
                  }}
                  error={!!errors.source}
                  className="pl-9"
                />
              </div>
            </div>
          )}

          {/* Text Content Input */}
          {sourceType === "text" && (
            <div className="space-y-2">
              <RAGTextarea
                placeholder="Paste your text content here..."
                value={textContent}
                onChange={(e) => {
                  setTextContent(e.target.value);
                  if (errors.source) setErrors({ ...errors, source: undefined });
                }}
                error={!!errors.source}
                rows={10}
                className="resize-none"
              />
            </div>
          )}

          {/* Link Documents List */}
          {sourceType === "link" && projectId && knowledgeBaseId && (
            <div className="space-y-2">
              <LinkDocumentsList
                projectId={projectId}
                kbId={knowledgeBaseId}
                onSelectionChange={setSelectedDocumentIds}
                selectedDocumentIds={selectedDocumentIds}
              />
            </div>
          )}

          {errors.source && (
            <p className="text-xs text-destructive">{errors.source}</p>
          )}
        </div>

        {/* Should Chunk - Hide when linking documents */}
        {sourceType !== "link" && (
          <div className="space-y-3 pb-2">
            <Label>Should Chunk</Label>
            <RadioGroup
              value={shouldChunk ? "yes" : "no"}
              onValueChange={(value) => setShouldChunk(value === "yes")}
            >
              <div className="flex items-center space-x-3">
                <RadioGroupItem className="shadow-icon" value="yes" id="should-chunk-yes" />
                <Label htmlFor="should-chunk-yes" className="font-normal cursor-pointer">
                  Yes — Document will be chunked for better retrieval
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <RadioGroupItem className="shadow-icon" value="no" id="should-chunk-no" />
                <Label htmlFor="should-chunk-no" className="font-normal cursor-pointer">
                  No — Document will not be chunked
                </Label>
              </div>
            </RadioGroup>
          </div>
        )}

      </div>
    </RAGModal>
  );
}


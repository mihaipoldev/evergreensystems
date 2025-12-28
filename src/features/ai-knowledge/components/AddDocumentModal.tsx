"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { TextareaShadow } from "@/components/admin/forms/TextareaShadow";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpload, faFileAlt, faCloudUploadAlt, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { uploadDocument } from "../document-api";
import { cn } from "@/lib/utils";
import type { RAGDocument } from "../document-types";

const uploadFileSchema = z.object({
  file: z.instanceof(File).refine((file) => file.size > 0, "File is required"),
});

const pasteTextSchema = z.object({
  content: z.string().min(1, "Content is required"),
});

type UploadFileFormValues = z.infer<typeof uploadFileSchema>;
type PasteTextFormValues = z.infer<typeof pasteTextSchema>;

type AddDocumentModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  knowledgeBaseId: string;
  onSuccess: (document: RAGDocument) => void;
};

export function AddDocumentModal({
  open,
  onOpenChange,
  knowledgeBaseId,
  onSuccess,
}: AddDocumentModalProps) {
  const [selectedOption, setSelectedOption] = useState<"upload" | "paste" | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileInputClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const uploadForm = useForm<UploadFileFormValues>({
    resolver: zodResolver(uploadFileSchema),
    defaultValues: {
      file: undefined,
    },
  });

  const pasteForm = useForm<PasteTextFormValues>({
    resolver: zodResolver(pasteTextSchema),
    defaultValues: {
      content: "",
    },
  });

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    uploadForm.setValue("file", file);
    uploadForm.clearErrors("file");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const onUploadSubmit = async (values: UploadFileFormValues) => {
    setIsSubmitting(true);
    try {
      const result = await uploadDocument({
        knowledge_base_id: knowledgeBaseId,
        title: null,
        source_type: "upload",
        file: values.file,
      });

      if (!result.success) {
        throw new Error(result.error || "Failed to upload document");
      }

      if (!result.document) {
        throw new Error("Document was created but not returned");
      }

      toast.success("Document uploaded successfully");
      uploadForm.reset();
      setSelectedFile(null);
      setSelectedOption(null);
      onOpenChange(false);
      onSuccess(result.document);
    } catch (error: any) {
      console.error("Error uploading document:", error);
      toast.error(error.message || "Failed to upload document");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onPasteSubmit = async (values: PasteTextFormValues) => {
    setIsSubmitting(true);
    try {
      const result = await uploadDocument({
        knowledge_base_id: knowledgeBaseId,
        title: null,
        source_type: "upload",
        content_type: "text/markdown",
        text_content: values.content,
      });

      if (!result.success) {
        throw new Error(result.error || "Failed to add document");
      }

      if (!result.document) {
        throw new Error("Document was created but not returned");
      }

      toast.success("Document added successfully");
      pasteForm.reset();
      setSelectedOption(null);
      onOpenChange(false);
      onSuccess(result.document);
    } catch (error: any) {
      console.error("Error adding document:", error);
      toast.error(error.message || "Failed to add document");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open && !isSubmitting) {
      uploadForm.reset();
      pasteForm.reset();
      setSelectedFile(null);
      setSelectedOption(null);
    }
    onOpenChange(open);
  };

  // Reset file input when switching to upload option
  useEffect(() => {
    if (selectedOption === "upload" && fileInputRef.current) {
      // Ensure the input is ready
      fileInputRef.current.value = "";
    }
  }, [selectedOption]);

  const handleBack = () => {
    setSelectedOption(null);
    uploadForm.reset();
    pasteForm.reset();
    setSelectedFile(null);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Document</DialogTitle>
          <DialogDescription>
            {selectedOption === null
              ? "Choose how you want to add a document to this knowledge base"
              : selectedOption === "upload"
              ? "Upload a file to add to this knowledge base"
              : "Paste text content to add to this knowledge base"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Selection Screen */}
          {selectedOption === null && (
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setSelectedOption("upload")}
                className="group relative rounded-xl bg-card/50 border border-border/40 p-8 text-center transition-all hover:bg-card hover:border-border/60 hover:shadow-md flex flex-col items-center justify-center min-h-[200px]"
              >
                <div className="h-16 w-16 rounded-full flex items-center justify-center bg-primary/10 mb-4 group-hover:bg-primary/20 transition-colors">
                  <FontAwesomeIcon icon={faUpload} className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Upload Document
                </h3>
                <p className="text-sm text-muted-foreground">
                  Upload a file from your computer
                </p>
              </button>

              <button
                type="button"
                onClick={() => setSelectedOption("paste")}
                className="group relative rounded-xl bg-card/50 border border-border/40 p-8 text-center transition-all hover:bg-card hover:border-border/60 hover:shadow-md flex flex-col items-center justify-center min-h-[200px]"
              >
                <div className="h-16 w-16 rounded-full flex items-center justify-center bg-primary/10 mb-4 group-hover:bg-primary/20 transition-colors">
                  <FontAwesomeIcon icon={faFileAlt} className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Paste Text
                </h3>
                <p className="text-sm text-muted-foreground">
                  Paste text content directly
                </p>
              </button>
            </div>
          )}

          {/* Upload Form */}
          {selectedOption === "upload" && (
            <Form {...uploadForm}>
              <form onSubmit={uploadForm.handleSubmit(onUploadSubmit)} className="space-y-4">
                <FormField
                  control={uploadForm.control}
                  name="file"
                  render={({ field: { onChange, ...field } }) => (
                    <FormItem>
                      <FormControl>
                        <div
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop}
                          onClick={handleFileInputClick}
                          className={cn(
                            "relative border-2 border-dashed rounded-xl py-16 px-12 transition-all cursor-pointer",
                            "hover:border-primary/50 hover:bg-primary/5",
                            isDragging && "border-primary bg-primary/10",
                            selectedFile ? "border-primary/50 bg-primary/5" : "border-border"
                          )}
                        >
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept=".md,.txt,.pdf,.docx"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleFileSelect(file);
                                onChange(file);
                              }
                            }}
                            className="hidden"
                            tabIndex={-1}
                          />
                          
                          <div className="flex flex-col items-center text-center space-y-4">
                            <div className="h-16 w-16 rounded-full flex items-center justify-center bg-primary/10">
                              <FontAwesomeIcon icon={faCloudUploadAlt} className="h-8 w-8 text-primary" />
                            </div>
                            
                            {selectedFile ? (
                              <>
                                <div>
                                  <p className="text-base font-semibold text-foreground mb-1">
                                    {selectedFile.name}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {(selectedFile.size / 1024).toFixed(2)} KB
                                  </p>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  Click or drop to change file
                                </p>
                              </>
                            ) : (
                              <>
                                <div>
                                  <p className="text-base font-semibold text-foreground mb-1">
                                    Drop your file here, or click to browse
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    Supports .md, .txt, .pdf, .docx files
                                  </p>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-between gap-2 pt-4">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleBack}
                    disabled={isSubmitting}
                  >
                    <FontAwesomeIcon icon={faArrowLeft} className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => handleOpenChange(false)}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting || !selectedFile}>
                      {isSubmitting ? "Uploading..." : "Upload"}
                    </Button>
                  </div>
                </div>
              </form>
            </Form>
          )}

          {/* Paste Form */}
          {selectedOption === "paste" && (
            <Form {...pasteForm}>
              <form onSubmit={pasteForm.handleSubmit(onPasteSubmit)} className="space-y-4">
                <FormField
                  control={pasteForm.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <TextareaShadow
                          placeholder="Paste your content here..."
                          rows={12}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-between gap-2 pt-4">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleBack}
                    disabled={isSubmitting}
                  >
                    <FontAwesomeIcon icon={faArrowLeft} className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => handleOpenChange(false)}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "Adding..." : "Add"}
                    </Button>
                  </div>
                </div>
              </form>
            </Form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

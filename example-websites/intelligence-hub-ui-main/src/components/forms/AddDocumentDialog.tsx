import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Upload, File, X, Link } from "lucide-react";

interface AddDocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  knowledgeBaseName?: string;
}

export function AddDocumentDialog({
  open,
  onOpenChange,
  knowledgeBaseName = "Product Documentation",
}: AddDocumentDialogProps) {
  const [title, setTitle] = useState("");
  const [sourceType, setSourceType] = useState<"file" | "url">("file");
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState("");
  const [contentType, setContentType] = useState("");
  const [chunkingOption, setChunkingOption] = useState("auto");
  const [errors, setErrors] = useState<{ title?: string; source?: string; contentType?: string }>({});
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      if (!title) {
        setTitle(selectedFile.name.replace(/\.[^/.]+$/, ""));
      }
      if (errors.source) setErrors({ ...errors, source: undefined });
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = () => {
    const newErrors: { title?: string; source?: string; contentType?: string } = {};
    
    if (!title.trim()) {
      newErrors.title = "Document title is required";
    }
    if (sourceType === "file" && !file) {
      newErrors.source = "Please select a file to upload";
    }
    if (sourceType === "url" && !url.trim()) {
      newErrors.source = "Please enter a valid URL";
    }
    if (!contentType) {
      newErrors.contentType = "Please select a content type";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // UI-only: would submit to backend
    console.log({ title, sourceType, file, url, contentType, chunkingOption });
    handleClose();
  };

  const handleClose = () => {
    setTitle("");
    setSourceType("file");
    setFile(null);
    setUrl("");
    setContentType("");
    setChunkingOption("auto");
    setErrors({});
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Add Document</DialogTitle>
          <DialogDescription>
            Upload a document to be indexed in your knowledge base.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Knowledge Base (Locked) */}
          <div className="space-y-2">
            <Label className="text-muted-foreground">Knowledge Base</Label>
            <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-md">
              <span className="text-sm font-medium">{knowledgeBaseName}</span>
              <Badge variant="secondary" className="ml-auto text-xs">Locked</Badge>
            </div>
          </div>

          {/* Document Title */}
          <div className="space-y-2">
            <Label htmlFor="doc-title">
              Document Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="doc-title"
              placeholder="e.g., API Reference Guide"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors({ ...errors, title: undefined });
              }}
              className={errors.title ? "border-destructive" : ""}
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title}</p>
            )}
          </div>

          {/* Source Type */}
          <div className="space-y-3">
            <Label>Source Type <span className="text-destructive">*</span></Label>
            <RadioGroup 
              value={sourceType} 
              onValueChange={(value: "file" | "url") => {
                setSourceType(value);
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
                <RadioGroupItem value="url" id="source-url" />
                <Label htmlFor="source-url" className="font-normal cursor-pointer">
                  URL
                </Label>
              </div>
            </RadioGroup>

            {/* File Upload Area */}
            {sourceType === "file" && (
              <div className="space-y-2">
                {!file ? (
                  <div
                    className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors hover:border-primary hover:bg-accent/50 ${
                      errors.source ? "border-destructive" : "border-border"
                    }`}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm font-medium">Click to upload</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      PDF, DOCX, TXT, MD, PPTX (max 50MB)
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-3 border border-border rounded-lg bg-muted/30">
                    <File className="h-8 w-8 text-primary shrink-0" />
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
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.doc,.txt,.md,.pptx"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            )}

            {/* URL Input */}
            {sourceType === "url" && (
              <div className="space-y-2">
                <div className="relative">
                  <Link className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="https://example.com/document.pdf"
                    value={url}
                    onChange={(e) => {
                      setUrl(e.target.value);
                      if (errors.source) setErrors({ ...errors, source: undefined });
                    }}
                    className={`pl-9 ${errors.source ? "border-destructive" : ""}`}
                  />
                </div>
              </div>
            )}

            {errors.source && (
              <p className="text-xs text-destructive">{errors.source}</p>
            )}
          </div>

          {/* Content Type */}
          <div className="space-y-2">
            <Label htmlFor="content-type">
              Content Type <span className="text-destructive">*</span>
            </Label>
            <Select 
              value={contentType} 
              onValueChange={(value) => {
                setContentType(value);
                if (errors.contentType) setErrors({ ...errors, contentType: undefined });
              }}
            >
              <SelectTrigger 
                id="content-type"
                className={errors.contentType ? "border-destructive" : ""}
              >
                <SelectValue placeholder="Select content type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="documentation">Documentation</SelectItem>
                <SelectItem value="policy">Policy</SelectItem>
                <SelectItem value="report">Report</SelectItem>
                <SelectItem value="article">Article</SelectItem>
                <SelectItem value="transcript">Transcript</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            {errors.contentType && (
              <p className="text-xs text-destructive">{errors.contentType}</p>
            )}
          </div>

          {/* Chunking Option */}
          <div className="space-y-2">
            <Label htmlFor="chunking">Chunking Strategy</Label>
            <Select value={chunkingOption} onValueChange={setChunkingOption}>
              <SelectTrigger id="chunking">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Auto (Recommended)</SelectItem>
                <SelectItem value="paragraph">By Paragraph</SelectItem>
                <SelectItem value="page">By Page</SelectItem>
                <SelectItem value="sentence">By Sentence</SelectItem>
                <SelectItem value="fixed">Fixed Size (512 tokens)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Auto-chunking analyzes document structure for optimal retrieval.
            </p>
          </div>

          {/* Status Indicator */}
          <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 border border-border rounded-md">
            <div className="h-2 w-2 rounded-full bg-muted-foreground" />
            <span className="text-sm text-muted-foreground">Status: Ready to upload</span>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            Upload Document
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormBlock, FormSection } from "./FormBlock";
import { Upload, Link, FileText, Globe, Github, Database } from "lucide-react";

interface DocumentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (data: DocumentFormData) => void;
  knowledgeBase?: string;
}

interface DocumentFormData {
  title: string;
  sourceType: string;
  file: File | null;
  url: string;
  contentType: string;
  chunking: boolean;
  knowledgeBase: string;
}

const sourceTypes = [
  { value: "upload", label: "File Upload", icon: Upload },
  { value: "url", label: "URL", icon: Link },
  { value: "github", label: "GitHub", icon: Github },
  { value: "notion", label: "Notion", icon: FileText },
  { value: "drive", label: "Google Drive", icon: Globe },
];

const contentTypes = [
  { value: "markdown", label: "Markdown" },
  { value: "pdf", label: "PDF Document" },
  { value: "docx", label: "Word Document" },
  { value: "text", label: "Plain Text" },
  { value: "html", label: "HTML" },
];

export function DocumentForm({ open, onOpenChange, onSubmit, knowledgeBase = "" }: DocumentFormProps) {
  const [formData, setFormData] = useState<DocumentFormData>({
    title: "",
    sourceType: "upload",
    file: null,
    url: "",
    contentType: "",
    chunking: true,
    knowledgeBase: knowledgeBase,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(formData);
    onOpenChange(false);
  };

  const handleCancel = () => {
    setFormData({
      title: "",
      sourceType: "upload",
      file: null,
      url: "",
      contentType: "",
      chunking: true,
      knowledgeBase: knowledgeBase,
    });
    onOpenChange(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData({ ...formData, file });
    if (file && !formData.title) {
      setFormData((prev) => ({ ...prev, file, title: file.name }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Add Document</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Import a document into your knowledge base
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          {/* Source Section */}
          <FormSection title="Source">
            <FormBlock label="Source Type" hint="Select how you want to add this document">
              <div className="grid grid-cols-5 gap-2">
                {sourceTypes.map((source) => {
                  const Icon = source.icon;
                  return (
                    <button
                      key={source.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, sourceType: source.value })}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border transition-colors ${
                        formData.sourceType === source.value
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border/50 bg-background hover:border-border text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="text-xs">{source.label}</span>
                    </button>
                  );
                })}
              </div>
            </FormBlock>
          </FormSection>

          {/* Content Section */}
          <FormSection title="Content">
            <FormBlock label="Title" required hint="Display name for this document">
              <Input
                placeholder="e.g., Getting Started Guide"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="bg-background"
              />
            </FormBlock>

            {formData.sourceType === "upload" ? (
              <FormBlock label="File" hint="Upload a document file">
                <label className="flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-border/50 rounded-lg bg-background hover:border-border cursor-pointer transition-colors">
                  <Upload className="h-6 w-6 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {formData.file ? formData.file.name : "Click to upload or drag and drop"}
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                    accept=".md,.pdf,.docx,.txt,.html"
                  />
                </label>
              </FormBlock>
            ) : (
              <FormBlock label="URL" required hint="Link to the document source">
                <Input
                  placeholder="https://..."
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="bg-background"
                />
              </FormBlock>
            )}

            <FormBlock label="Content Type" hint="Format of the document content">
              <Select
                value={formData.contentType}
                onValueChange={(value) => setFormData({ ...formData, contentType: value })}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Auto-detect" />
                </SelectTrigger>
                <SelectContent>
                  {contentTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormBlock>
          </FormSection>

          {/* Processing Section */}
          <FormSection title="Processing">
            <FormBlock label="Chunking" hint="Split document into smaller searchable segments">
              <div className="flex items-center gap-3">
                <Switch
                  checked={formData.chunking}
                  onCheckedChange={(checked) => setFormData({ ...formData, chunking: checked })}
                />
                <span className="text-sm text-muted-foreground">
                  {formData.chunking ? "Enabled" : "Disabled"}
                </span>
              </div>
            </FormBlock>

            <FormBlock label="Knowledge Base" hint="Target knowledge base for this document">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-mono bg-background px-3 py-2 rounded-md border border-border/50 flex-1">
                  {knowledgeBase || "Not selected"}
                </span>
              </div>
            </FormBlock>
          </FormSection>

          <DialogFooter className="gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={!formData.title}>
              Add Document
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormBlock, FormSection } from "./FormBlock";

interface KnowledgeBaseFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (data: KnowledgeBaseFormData) => void;
}

interface KnowledgeBaseFormData {
  name: string;
  type: string;
  description: string;
  visibility: string;
  active: boolean;
}

export function KnowledgeBaseForm({ open, onOpenChange, onSubmit }: KnowledgeBaseFormProps) {
  const [formData, setFormData] = useState<KnowledgeBaseFormData>({
    name: "",
    type: "",
    description: "",
    visibility: "private",
    active: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(formData);
    onOpenChange(false);
  };

  const handleCancel = () => {
    setFormData({ name: "", type: "", description: "", visibility: "private", active: true });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Create Knowledge Base</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Add a new knowledge repository to your system
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <FormSection>
            <FormBlock label="Name" required hint="A clear, descriptive name for this knowledge base">
              <Input
                placeholder="e.g., Product Documentation"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-background"
              />
            </FormBlock>

            <FormBlock label="Type" hint="Categorize the purpose of this knowledge base">
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Select a type..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="company">Company</SelectItem>
                  <SelectItem value="niche">Niche</SelectItem>
                  <SelectItem value="client">Client</SelectItem>
                  <SelectItem value="purpose">Purpose</SelectItem>
                </SelectContent>
              </Select>
            </FormBlock>

            <FormBlock label="Description" hint="Optional context about the contents or use case">
              <Textarea
                placeholder="Describe what this knowledge base will contain..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="bg-background resize-none min-h-[80px]"
              />
            </FormBlock>

            <FormBlock label="Visibility" hint="Control who can access this knowledge base">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, visibility: "private" })}
                  className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    formData.visibility === "private"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  Private
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, visibility: "public" })}
                  className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    formData.visibility === "public"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  Public
                </button>
              </div>
            </FormBlock>

            <FormBlock label="Active" hint="Inactive knowledge bases won't be used in queries">
              <div className="flex items-center gap-3">
                <Switch
                  checked={formData.active}
                  onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
                />
                <span className="text-sm text-muted-foreground">
                  {formData.active ? "Enabled" : "Disabled"}
                </span>
              </div>
            </FormBlock>
          </FormSection>

          <FormSection title="Advanced" collapsible defaultOpen={false}>
            <FormBlock label="Metadata" hint="Auto-generated system metadata">
              <div className="text-sm text-muted-foreground font-mono bg-background px-3 py-2 rounded-md border border-border/50">
                Will be generated on creation
              </div>
            </FormBlock>

            <FormBlock label="Owner" hint="The user who created this knowledge base">
              <div className="text-sm text-muted-foreground font-mono bg-background px-3 py-2 rounded-md border border-border/50">
                Current User
              </div>
            </FormBlock>
          </FormSection>

          <DialogFooter className="gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={!formData.name}>
              Create KB
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

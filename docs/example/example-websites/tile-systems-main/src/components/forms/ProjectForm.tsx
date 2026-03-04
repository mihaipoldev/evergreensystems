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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormBlock, FormSection } from "./FormBlock";

interface ProjectFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (data: ProjectFormData) => void;
}

interface ProjectFormData {
  clientName: string;
  status: string;
  linkedKB: string;
  description: string;
}

const statusOptions = [
  { value: "active", label: "Active", color: "bg-emerald-500" },
  { value: "pending", label: "Pending", color: "bg-amber-500" },
  { value: "archived", label: "Archived", color: "bg-zinc-400" },
];

const knowledgeBases = [
  { value: "product-docs", label: "Product Documentation" },
  { value: "support-files", label: "Customer Support Files" },
  { value: "analytics-db", label: "Analytics Database" },
  { value: "engineering-specs", label: "Engineering Specs" },
  { value: "marketing-assets", label: "Marketing Assets" },
];

export function ProjectForm({ open, onOpenChange, onSubmit }: ProjectFormProps) {
  const [formData, setFormData] = useState<ProjectFormData>({
    clientName: "",
    status: "active",
    linkedKB: "",
    description: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(formData);
    onOpenChange(false);
  };

  const handleCancel = () => {
    setFormData({ clientName: "", status: "active", linkedKB: "", description: "" });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Create Project</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Start a new project to organize your work
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          {/* Client Info Section */}
          <FormSection title="Client Information">
            <FormBlock label="Client Name" required hint="The client or project identifier">
              <Input
                placeholder="e.g., Acme Corp"
                value={formData.clientName}
                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                className="bg-background"
              />
            </FormBlock>

            <FormBlock label="Description" hint="Brief overview of the project scope">
              <Textarea
                placeholder="What is this project about?"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="bg-background resize-none min-h-[80px]"
              />
            </FormBlock>
          </FormSection>

          {/* Configuration Section */}
          <FormSection title="Configuration">
            <FormBlock label="Status" hint="Current state of the project">
              <div className="flex gap-2">
                {statusOptions.map((status) => (
                  <button
                    key={status.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, status: status.value })}
                    className={`flex items-center gap-2 flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      formData.status === status.value
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${status.color}`} />
                    {status.label}
                  </button>
                ))}
              </div>
            </FormBlock>

            <FormBlock label="Linked Knowledge Base" hint="Connect to an existing knowledge base">
              <Select
                value={formData.linkedKB}
                onValueChange={(value) => setFormData({ ...formData, linkedKB: value })}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="None (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {knowledgeBases.map((kb) => (
                    <SelectItem key={kb.value} value={kb.value}>
                      {kb.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormBlock>
          </FormSection>

          <DialogFooter className="gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={!formData.clientName}>
              Create Project
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

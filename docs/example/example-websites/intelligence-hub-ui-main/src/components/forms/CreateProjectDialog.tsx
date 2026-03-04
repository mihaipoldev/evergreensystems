import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const knowledgeBases = [
  { id: "product-docs", name: "Product Documentation" },
  { id: "customer-support", name: "Customer Support" },
  { id: "legal-compliance", name: "Legal Compliance" },
  { id: "hr-policies", name: "HR Policies" },
  { id: "sales-enablement", name: "Sales Enablement" },
  { id: "engineering-wiki", name: "Engineering Wiki" },
  { id: "marketing-content", name: "Marketing Content" },
  { id: "financial-reports", name: "Financial Reports" },
];

export function CreateProjectDialog({
  open,
  onOpenChange,
}: CreateProjectDialogProps) {
  const [clientName, setClientName] = useState("");
  const [status, setStatus] = useState("");
  const [linkedKB, setLinkedKB] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<{ 
    clientName?: string; 
    status?: string;
    linkedKB?: string;
  }>({});

  const handleSubmit = () => {
    const newErrors: { clientName?: string; status?: string; linkedKB?: string } = {};
    
    if (!clientName.trim()) {
      newErrors.clientName = "Client name is required";
    }
    if (!status) {
      newErrors.status = "Please select a status";
    }
    if (!linkedKB) {
      newErrors.linkedKB = "Please select a knowledge base";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // UI-only: would submit to backend
    console.log({ clientName, status, linkedKB, description });
    handleClose();
  };

  const handleClose = () => {
    setClientName("");
    setStatus("");
    setLinkedKB("");
    setDescription("");
    setErrors({});
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Create Project</DialogTitle>
          <DialogDescription>
            Set up a new AI-powered project for your organization.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Client Name */}
          <div className="space-y-2">
            <Label htmlFor="client-name">
              Client Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="client-name"
              placeholder="e.g., Acme Corporation"
              value={clientName}
              onChange={(e) => {
                setClientName(e.target.value);
                if (errors.clientName) setErrors({ ...errors, clientName: undefined });
              }}
              className={errors.clientName ? "border-destructive" : ""}
            />
            {errors.clientName && (
              <p className="text-xs text-destructive">{errors.clientName}</p>
            )}
          </div>

          {/* Project Status */}
          <div className="space-y-2">
            <Label htmlFor="project-status">
              Project Status <span className="text-destructive">*</span>
            </Label>
            <Select 
              value={status} 
              onValueChange={(value) => {
                setStatus(value);
                if (errors.status) setErrors({ ...errors, status: undefined });
              }}
            >
              <SelectTrigger 
                id="project-status"
                className={errors.status ? "border-destructive" : ""}
              >
                <SelectValue placeholder="Select initial status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="active">Active</SelectItem>
              </SelectContent>
            </Select>
            {errors.status && (
              <p className="text-xs text-destructive">{errors.status}</p>
            )}
          </div>

          {/* Linked Knowledge Base */}
          <div className="space-y-2">
            <Label htmlFor="linked-kb">
              Linked Knowledge Base <span className="text-destructive">*</span>
            </Label>
            <Select 
              value={linkedKB} 
              onValueChange={(value) => {
                setLinkedKB(value);
                if (errors.linkedKB) setErrors({ ...errors, linkedKB: undefined });
              }}
            >
              <SelectTrigger 
                id="linked-kb"
                className={errors.linkedKB ? "border-destructive" : ""}
              >
                <SelectValue placeholder="Select knowledge base" />
              </SelectTrigger>
              <SelectContent>
                {knowledgeBases.map((kb) => (
                  <SelectItem key={kb.id} value={kb.id}>
                    {kb.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.linkedKB && (
              <p className="text-xs text-destructive">{errors.linkedKB}</p>
            )}
            <p className="text-xs text-muted-foreground">
              This knowledge base will be used as the primary data source for this project.
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="project-description">Description</Label>
            <Textarea
              id="project-description"
              placeholder="Describe the project goals, scope, and expected outcomes..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            Create Project
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

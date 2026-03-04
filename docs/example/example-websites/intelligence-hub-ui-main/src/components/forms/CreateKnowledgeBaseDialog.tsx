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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";

interface CreateKnowledgeBaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateKnowledgeBaseDialog({
  open,
  onOpenChange,
}: CreateKnowledgeBaseDialogProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState("private");
  const [isActive, setIsActive] = useState(true);
  const [errors, setErrors] = useState<{ name?: string; type?: string }>({});

  const handleSubmit = () => {
    const newErrors: { name?: string; type?: string } = {};
    
    if (!name.trim()) {
      newErrors.name = "Knowledge base name is required";
    }
    if (!type) {
      newErrors.type = "Please select a type";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // UI-only: would submit to backend
    console.log({ name, type, description, visibility, isActive });
    handleClose();
  };

  const handleClose = () => {
    setName("");
    setType("");
    setDescription("");
    setVisibility("private");
    setIsActive(true);
    setErrors({});
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Create Knowledge Base</DialogTitle>
          <DialogDescription>
            Set up a new knowledge repository for your organization.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Section: Basic Information */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-foreground">Basic Information</h4>
            
            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="kb-name">
                Knowledge Base Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="kb-name"
                placeholder="e.g., Product Documentation"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors({ ...errors, name: undefined });
                }}
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name}</p>
              )}
            </div>

            {/* Type Field */}
            <div className="space-y-2">
              <Label htmlFor="kb-type">
                Type <span className="text-destructive">*</span>
              </Label>
              <Select 
                value={type} 
                onValueChange={(value) => {
                  setType(value);
                  if (errors.type) setErrors({ ...errors, type: undefined });
                }}
              >
                <SelectTrigger 
                  id="kb-type"
                  className={errors.type ? "border-destructive" : ""}
                >
                  <SelectValue placeholder="Select knowledge base type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vector">Vector</SelectItem>
                  <SelectItem value="graph">Graph</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text-xs text-destructive">{errors.type}</p>
              )}
            </div>

            {/* Description Field */}
            <div className="space-y-2">
              <Label htmlFor="kb-description">Description</Label>
              <Textarea
                id="kb-description"
                placeholder="Describe the purpose and contents of this knowledge base..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          {/* Section: Access & Status */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-foreground">Access & Status</h4>

            {/* Visibility Field */}
            <div className="space-y-3">
              <Label>Visibility</Label>
              <RadioGroup value={visibility} onValueChange={setVisibility}>
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="private" id="visibility-private" />
                  <Label htmlFor="visibility-private" className="font-normal cursor-pointer">
                    Private — Only team members can access
                  </Label>
                </div>
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="internal" id="visibility-internal" />
                  <Label htmlFor="visibility-internal" className="font-normal cursor-pointer">
                    Internal — All organization members can access
                  </Label>
                </div>
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="public" id="visibility-public" />
                  <Label htmlFor="visibility-public" className="font-normal cursor-pointer">
                    Public — Anyone with the link can access
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Active Status Toggle */}
            <div className="flex items-center justify-between rounded-lg border border-border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="kb-active" className="cursor-pointer">Active Status</Label>
                <p className="text-xs text-muted-foreground">
                  Enable to allow indexing and queries
                </p>
              </div>
              <Switch
                id="kb-active"
                checked={isActive}
                onCheckedChange={setIsActive}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            Create Knowledge Base
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

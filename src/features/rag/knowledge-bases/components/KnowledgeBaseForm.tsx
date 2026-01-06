"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  RAGInput,
  RAGTextarea,
  RAGSelect,
  RAGSelectTrigger,
  RAGSelectContent,
  RAGSelectItem,
  RAGSelectValue,
} from "@/features/rag/shared/components";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock, faGlobe } from "@fortawesome/free-solid-svg-icons";
import type { KnowledgeBase } from "../types";

interface KnowledgeBaseFormProps {
  isEdit: boolean;
  initialData?: KnowledgeBase | null;
  returnTo?: string;
}

export function KnowledgeBaseForm({ isEdit, initialData, returnTo }: KnowledgeBaseFormProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<"private" | "public">("private");
  const [isActive, setIsActive] = useState(true);
  const [errors, setErrors] = useState<{ name?: string; type?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form when initialData changes
  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "");
      setType(initialData.kb_type || initialData.type || "");
      setDescription(initialData.description || "");
      setVisibility(initialData.visibility || "private");
      setIsActive(initialData.is_active ?? true);
    } else {
      // Reset to defaults for create mode
      setName("");
      setType("");
      setDescription("");
      setVisibility("private");
      setIsActive(true);
    }
    setErrors({});
  }, [initialData?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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

    setIsSubmitting(true);
    try {
      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      const url = isEdit
        ? `/api/intel/knowledge-base/${initialData!.id}`
        : "/api/intel/knowledge-base";
      const method = isEdit ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({
          name,
          description: description || null,
          kb_type: type,
          visibility,
          is_active: isActive,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Failed to ${isEdit ? "update" : "create"} knowledge base`);
      }

      const result = await response.json();
      toast.success(`Knowledge base ${isEdit ? "updated" : "created"} successfully`);
      
      if (returnTo) {
        router.push(returnTo);
      } else if (isEdit) {
        router.refresh();
      } else {
        router.push(`/admin/kb/${result.id}`);
      }
      router.refresh();
    } catch (error: any) {
      console.error(`Error ${isEdit ? "updating" : "creating"} knowledge base:`, error);
      toast.error(error.message || `Failed to ${isEdit ? "update" : "create"} knowledge base`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Section: Basic Information */}
      <div className="space-y-4">
        {/* Name Field */}
        <div className="space-y-2">
          <Label htmlFor="kb-name">
            Name <span className="text-destructive">*</span>
          </Label>
          <RAGInput
            id="kb-name"
            placeholder="e.g., Product Documentation"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errors.name) setErrors({ ...errors, name: undefined });
            }}
            error={!!errors.name}
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
          <RAGSelect
            value={type}
            onValueChange={(value) => {
              setType(value);
              if (errors.type) setErrors({ ...errors, type: undefined });
            }}
          >
            <RAGSelectTrigger
              id="kb-type"
              error={!!errors.type}
            >
              <RAGSelectValue placeholder="Select knowledge base type" />
            </RAGSelectTrigger>
            <RAGSelectContent>
              <RAGSelectItem value="niche_intelligence">Niche Intelligence</RAGSelectItem>
              <RAGSelectItem value="support">Contact Support</RAGSelectItem>
              <RAGSelectItem value="internal">Internal Operations</RAGSelectItem>
              <RAGSelectItem value="project">Project</RAGSelectItem>
              <RAGSelectItem value="client">Client</RAGSelectItem>
            </RAGSelectContent>
          </RAGSelect>
          {errors.type && (
            <p className="text-xs text-destructive">{errors.type}</p>
          )}
        </div>

        {/* Description Field */}
        <div className="space-y-2">
          <Label htmlFor="kb-description">Description</Label>
          <RAGTextarea
            id="kb-description"
            placeholder="Describe the purpose and contents of this knowledge base..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={6}
          />
        </div>
      </div>

      {/* Section: Access & Status */}
      <div className="space-y-4">
        {/* Visibility Field */}
        <div className="space-y-3 pb-2">
          <Label>Visibility</Label>
          <RadioGroup value={visibility} onValueChange={(value) => setVisibility(value as "private" | "public")}>
            <div className="flex items-center space-x-3">
              <RadioGroupItem className="shadow-icon" value="private" id="visibility-private" />
              <Label htmlFor="visibility-private" className="font-normal cursor-pointer flex items-center gap-2">
                <FontAwesomeIcon icon={faLock} className="h-3.5 w-3.5 text-muted-foreground" />
                Private — Only team members can access
              </Label>
            </div>
            <div className="flex items-center space-x-3">
              <RadioGroupItem className="shadow-icon" value="public" id="visibility-public" />
              <Label htmlFor="visibility-public" className="font-normal cursor-pointer flex items-center gap-2">
                <FontAwesomeIcon icon={faGlobe} className="h-3.5 w-3.5 text-muted-foreground" />
                Public — Anyone with the link can access
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Active Status Toggle */}
        <div className="flex items-center justify-between bg-card/80 rounded-lg border border-none shadow-card p-4">
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

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-4 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? isEdit
              ? "Updating..."
              : "Creating..."
            : isEdit
              ? "Update Knowledge Base"
              : "Create Knowledge Base"}
        </Button>
      </div>
    </form>
  );
}


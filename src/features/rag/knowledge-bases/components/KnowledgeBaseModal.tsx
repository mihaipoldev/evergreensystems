"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { DialogFooter } from "@/components/ui/dialog";
import {
  RAGInput,
  RAGTextarea,
  RAGSelect,
  RAGSelectTrigger,
  RAGSelectContent,
  RAGSelectItem,
  RAGSelectValue,
} from "@/features/rag/shared/components";
import { ModalShell } from "@/components/shared/ModalShell";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock, faGlobe } from "@fortawesome/free-solid-svg-icons";
import type { KnowledgeBase } from "../types";

interface KnowledgeBaseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: KnowledgeBase | null;
  onSuccess?: (updatedData: KnowledgeBase) => void;
}

export function KnowledgeBaseModal({
  open,
  onOpenChange,
  initialData,
  onSuccess,
}: KnowledgeBaseModalProps) {
  const router = useRouter();
  const isEdit = !!initialData;
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<"private" | "public">("private");
  const [isActive, setIsActive] = useState(true);
  const [errors, setErrors] = useState<{ name?: string; type?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form when initialData changes or modal opens
  useEffect(() => {
    if (open) {
      if (initialData) {
        // Fetch the latest data when opening the modal in edit mode
        const fetchLatestData = async () => {
          try {
            const supabase = createClient();
            const { data: sessionData } = await supabase.auth.getSession();
            const accessToken = sessionData?.session?.access_token;

            const response = await fetch(`/api/intel/knowledge-base/${initialData.id}`, {
              headers: {
                ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
              },
            });

            if (response.ok) {
              const latestData = await response.json();
              setName(latestData.name || "");
              setType(latestData.kb_type || "");
              setDescription(latestData.description || "");
              setVisibility(latestData.visibility || "private");
              setIsActive(latestData.is_active ?? true);
            } else {
              // Fallback to initialData if fetch fails
              setName(initialData.name || "");
              setType(initialData.kb_type || "");
              setDescription(initialData.description || "");
              setVisibility(initialData.visibility || "private");
              setIsActive(initialData.is_active ?? true);
            }
          } catch (error) {
            console.error("Error fetching latest knowledge base data:", error);
            // Fallback to initialData if fetch fails
            setName(initialData.name || "");
            setType(initialData.kb_type || "");
            setDescription(initialData.description || "");
            setVisibility(initialData.visibility || "private");
            setIsActive(initialData.is_active ?? true);
          }
        };

        fetchLatestData();
      } else {
        // Reset to defaults for create mode
        setName("");
        setType("");
        setDescription("");
        setVisibility("private");
        setIsActive(true);
      }
      setErrors({});
    }
  }, [initialData?.id, open]); // Only depend on ID, not the whole object

  const handleSubmit = async () => {
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
      
      if (onSuccess) {
        // Pass the updated data back to the parent
        onSuccess(result);
      }
      
      handleClose();
      
      if (isEdit) {
        router.refresh();
      } else {
        // Only navigate if onSuccess callback is not provided
        // This allows parent components to handle navigation/refresh themselves
        if (!onSuccess) {
          router.push(`/intel/knowledge-bases/${result.id}`);
        }
        router.refresh();
      }
    } catch (error: any) {
      console.error(`Error ${isEdit ? "updating" : "creating"} knowledge base:`, error);
      toast.error(error.message || `Failed to ${isEdit ? "update" : "create"} knowledge base`);
    } finally {
      setIsSubmitting(false);
    }
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
    <ModalShell
      open={open}
      onOpenChange={handleClose}
      title={name.trim() || (isEdit ? "Edit Knowledge Base" : "Create Knowledge Base")}
      titleIcon={<FontAwesomeIcon icon={faLock} className="w-5 h-5 md:w-6 md:h-6" />}
      description="Configure knowledge base type and visibility"
      maxWidth="4xl"
      maxHeight="90vh"
      showScroll
      footer={
        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting
              ? isEdit
                ? "Updating..."
                : "Creating..."
              : isEdit
                ? "Update Knowledge Base"
                : "Create Knowledge Base"}
          </Button>
        </DialogFooter>
      }
    >
      <div className="space-y-4 md:space-y-5">
            {/* Name Field */}
            <div className="space-y-1.5 md:space-y-2">
              <Label htmlFor="kb-name" className="text-sm">
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
            <div className="space-y-1.5 md:space-y-2">
              <Label htmlFor="kb-type" className="text-sm">
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
            <div className="space-y-1.5 md:space-y-2 pt-2 md:pt-0 border-t border-border/50 md:border-t-0">
              <Label htmlFor="kb-description" className="text-sm">Description</Label>
              <RAGTextarea
                id="kb-description"
                placeholder="Describe the purpose and contents of this knowledge base..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={6}
                className="min-h-[100px] md:min-h-[180px]"
              />
            </div>

            {/* Section: Access & Status */}
            <div className="space-y-3 md:space-y-4 pt-3 md:pt-0 border-t border-border/50 md:border-t-0">
            {/* Visibility Field */}
            <div className="space-y-2 md:space-y-3 pb-2">
              <Label className="text-sm">Visibility</Label>
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
            <div className="flex items-center justify-between bg-card/80 rounded-lg border border-none shadow-card p-3 md:p-4">
              <div className="space-y-0.5">
                <Label htmlFor="kb-active" className="cursor-pointer text-sm">Active Status</Label>
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
    </ModalShell>
  );
}


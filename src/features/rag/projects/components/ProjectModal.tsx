"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
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
  RAGModal,
} from "@/features/rag/shared/components";
import type { Project } from "../types";

interface ProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Project | null;
  onSuccess?: (updatedData: Project) => void;
}

export function ProjectModal({
  open,
  onOpenChange,
  initialData,
  onSuccess,
}: ProjectModalProps) {
  const router = useRouter();
  const isEdit = !!initialData;
  const [clientName, setClientName] = useState("");
  const [status, setStatus] = useState<"active" | "onboarding" | "delivered" | "archived">("active");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<{ clientName?: string; status?: string }>({});
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

            const response = await fetch(`/api/intel/projects/${initialData.id}`, {
              headers: {
                ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
              },
            });

            if (response.ok) {
              const latestData = await response.json();
              setClientName(latestData.client_name || "");
              setStatus(latestData.status || "active");
              setDescription(latestData.description || "");
            } else {
              // Fallback to initialData if fetch fails
              setClientName(initialData.client_name || "");
              setStatus(initialData.status || "active");
              setDescription(initialData.description || "");
            }
          } catch (error) {
            console.error("Error fetching latest project data:", error);
            // Fallback to initialData if fetch fails
            setClientName(initialData.client_name || "");
            setStatus(initialData.status || "active");
            setDescription(initialData.description || "");
          }
        };

        fetchLatestData();
      } else {
        // Reset to defaults for create mode
        setClientName("");
        setStatus("active");
        setDescription("");
      }
      setErrors({});
    }
  }, [initialData?.id, open]);

  const handleSubmit = async () => {
    const newErrors: { clientName?: string; status?: string } = {};

    if (!clientName.trim()) {
      newErrors.clientName = "Client name is required";
    }
    if (!status) {
      newErrors.status = "Please select a status";
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
        ? `/api/intel/projects/${initialData!.id}`
        : "/api/intel/projects";
      const method = isEdit ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({
          client_name: clientName,
          status,
          description: description || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Failed to ${isEdit ? "update" : "create"} project`);
      }

      const result = await response.json();
      toast.success(`Project ${isEdit ? "updated" : "created"} successfully`);
      
      if (isEdit && onSuccess) {
        onSuccess(result);
      }
      
      handleClose();
      
      if (isEdit) {
        router.refresh();
      } else {
        router.push(`/intel/projects/${result.id}`);
        router.refresh();
      }
    } catch (error: any) {
      console.error(`Error ${isEdit ? "updating" : "creating"} project:`, error);
      toast.error(error.message || `Failed to ${isEdit ? "update" : "create"} project`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setClientName("");
    setStatus("active");
    setDescription("");
    setErrors({});
    onOpenChange(false);
  };

  return (
    <RAGModal
      open={open}
      onOpenChange={handleClose}
      title={isEdit ? "Edit Project" : "Create Project"}
      footer={
        <>
          <Button
            className="shadow-buttons border-none bg-muted/20 hover:bg-accent/30"
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            className="shadow-buttons border-none"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting
              ? isEdit
                ? "Updating..."
                : "Creating..."
              : isEdit
                ? "Update Project"
                : "Create Project"}
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        {/* Client Name */}
        <div className="space-y-2">
          <Label htmlFor="client-name">
            Client Name <span className="text-destructive">*</span>
          </Label>
          <RAGInput
            id="client-name"
            placeholder="e.g., Acme Corporation"
            value={clientName}
            onChange={(e) => {
              setClientName(e.target.value);
              if (errors.clientName) setErrors({ ...errors, clientName: undefined });
            }}
            error={!!errors.clientName}
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
          <RAGSelect
            value={status}
            onValueChange={(value) => {
              setStatus(value as "active" | "onboarding" | "delivered" | "archived");
              if (errors.status) setErrors({ ...errors, status: undefined });
            }}
          >
            <RAGSelectTrigger
              id="project-status"
              error={!!errors.status}
            >
              <RAGSelectValue placeholder="Select initial status" />
            </RAGSelectTrigger>
            <RAGSelectContent>
              <RAGSelectItem value="active">Active</RAGSelectItem>
              <RAGSelectItem value="onboarding">Onboarding</RAGSelectItem>
              <RAGSelectItem value="delivered">Delivered</RAGSelectItem>
              <RAGSelectItem value="archived">Archived</RAGSelectItem>
            </RAGSelectContent>
          </RAGSelect>
          {errors.status && (
            <p className="text-xs text-destructive">{errors.status}</p>
          )}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="project-description">Description</Label>
          <RAGTextarea
            id="project-description"
            placeholder="Describe the project goals, scope, and expected outcomes..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
          />
        </div>
      </div>
    </RAGModal>
  );
}


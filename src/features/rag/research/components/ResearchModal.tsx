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
import type { ResearchSubject } from "../types";

interface ResearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: ResearchSubject | null;
  onSuccess?: (updatedData: ResearchSubject) => void;
}

export function ResearchModal({
  open,
  onOpenChange,
  initialData,
  onSuccess,
}: ResearchModalProps) {
  const router = useRouter();
  const isEdit = !!initialData;
  const [name, setName] = useState("");
  const [geography, setGeography] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<{ name?: string }>({});
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

            const response = await fetch(`/api/intel/research/${initialData.id}`, {
              headers: {
                ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
              },
            });

            if (response.ok) {
              const latestData = await response.json();
              setName(latestData.name || "");
              setGeography(latestData.geography || "");
              setCategory(latestData.category || "");
              setType(latestData.type || "");
              setDescription(latestData.description || "");
            } else {
              // Fallback to initialData if fetch fails
              setName(initialData.name || "");
              setGeography(initialData.geography || "");
              setCategory(initialData.category || "");
              setType(initialData.type || "");
              setDescription(initialData.description || "");
            }
          } catch (error) {
            console.error("Error fetching latest research subject data:", error);
            // Fallback to initialData if fetch fails
            setName(initialData.name || "");
            setGeography(initialData.geography || "");
            setCategory(initialData.category || "");
            setType(initialData.type || "");
            setDescription(initialData.description || "");
          }
        };

        fetchLatestData();
      } else {
        // Reset to defaults for create mode
        setName("");
        setGeography("");
        setCategory("");
        setType("");
        setDescription("");
      }
      setErrors({});
    }
  }, [initialData?.id, open]);

  const handleSubmit = async () => {
    const newErrors: { name?: string } = {};

    if (!name.trim()) {
      newErrors.name = "Name is required";
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
        ? `/api/intel/research/${initialData!.id}`
        : "/api/intel/research";
      const method = isEdit ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({
          name: name.trim(),
          geography: geography.trim() || null,
          category: category.trim() || null,
          type: type.trim() || null,
          description: description.trim() || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Failed to ${isEdit ? "update" : "create"} research subject`);
      }

      const result = await response.json();
      toast.success(`Research subject ${isEdit ? "updated" : "created"} successfully`);
      
      if (isEdit && onSuccess) {
        onSuccess(result);
      }
      
      handleClose();
      
      if (isEdit) {
        router.refresh();
      } else {
        router.push(`/intel/research/${result.id}`);
        router.refresh();
      }
    } catch (error: any) {
      console.error(`Error ${isEdit ? "updating" : "creating"} research subject:`, error);
      toast.error(error.message || `Failed to ${isEdit ? "update" : "create"} research subject`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setName("");
    setGeography("");
    setCategory("");
    setType("");
    setDescription("");
    setErrors({});
    onOpenChange(false);
  };

  return (
    <RAGModal
      open={open}
      onOpenChange={handleClose}
      title={isEdit ? "Edit Research Subject" : "Create Research Subject"}
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
                ? "Update Research Subject"
                : "Create Research Subject"}
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="research-name">
            Name <span className="text-destructive">*</span>
          </Label>
          <RAGInput
            id="research-name"
            placeholder="e.g., AI/ML Consulting"
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

        {/* Geography */}
        <div className="space-y-2">
          <Label htmlFor="research-geography">Geography</Label>
          <RAGInput
            id="research-geography"
            placeholder="e.g., United States, Europe"
            value={geography}
            onChange={(e) => setGeography(e.target.value)}
          />
        </div>

        {/* Category */}
        <div className="space-y-2">
          <Label htmlFor="research-category">Category</Label>
          <RAGInput
            id="research-category"
            placeholder="e.g., B2B Services, Manufacturing"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
        </div>

        {/* Type */}
        <div className="space-y-2">
          <Label htmlFor="research-type">Type</Label>
          <RAGInput
            id="research-type"
            placeholder="e.g., Technology, Healthcare"
            value={type}
            onChange={(e) => setType(e.target.value)}
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="research-description">Description</Label>
          <RAGTextarea
            id="research-description"
            placeholder="Describe the research subject..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
          />
        </div>
      </div>
    </RAGModal>
  );
}


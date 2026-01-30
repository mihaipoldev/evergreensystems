"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { DialogFooter } from "@/components/ui/dialog";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFolderOpen } from "@fortawesome/free-solid-svg-icons";
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
import type { Project } from "../types";
import type { ProjectType } from "@/features/rag/project-type/types";

interface ProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Project | null;
  /** When creating, pre-select this project type (e.g. when opening from a niche-filtered list). */
  initialProjectTypeId?: string;
  onSuccess?: (updatedData: Project) => void;
}

export function ProjectModal({
  open,
  onOpenChange,
  initialData,
  initialProjectTypeId,
  onSuccess,
}: ProjectModalProps) {
  const router = useRouter();
  const isEdit = !!initialData;
  
  // Project type selection
  const [projectTypeId, setProjectTypeId] = useState<string>("");
  const [projectTypes, setProjectTypes] = useState<ProjectType[]>([]);
  const [loadingProjectTypes, setLoadingProjectTypes] = useState(true);
  
  // Client project fields
  const [clientName, setClientName] = useState("");
  const [status, setStatus] = useState<"active" | "onboarding" | "delivered" | "archived">("active");
  
  // Niche research fields
  const [name, setName] = useState("");
  const [geography, setGeography] = useState("");
  const [category, setCategory] = useState("");
  
  // Common fields
  const [description, setDescription] = useState("");
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Get selected project type name
  const selectedProjectType = projectTypes.find(pt => pt.id === projectTypeId);
  const isClientType = selectedProjectType?.name === "client";
  const isNicheType = selectedProjectType?.name === "niche";

  // Load project types on mount
  useEffect(() => {
    const loadProjectTypes = async () => {
      try {
        setLoadingProjectTypes(true);
        const supabase = createClient();
        const { data, error } = await supabase
          .from("project_types")
          .select("*")
          .eq("enabled", true)
          .order("name", { ascending: true });

        if (error) {
          throw error;
        }

        setProjectTypes((data || []) as ProjectType[]);
      } catch (error) {
        console.error("Error loading project types:", error);
        toast.error("Failed to load project types");
      } finally {
        setLoadingProjectTypes(false);
      }
    };
    loadProjectTypes();
  }, []);

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
              setProjectTypeId(latestData.project_type_id || "");
              setClientName(latestData.client_name || "");
              setName(latestData.name || "");
              setStatus(latestData.status || "active");
              setGeography(latestData.geography || "");
              setCategory(latestData.category || "");
              setDescription(latestData.description || "");
            } else {
              // Fallback to initialData if fetch fails
              setProjectTypeId(initialData.project_type_id || "");
              setClientName(initialData.client_name || "");
              setName(initialData.name || "");
              setStatus(initialData.status || "active");
              setGeography(initialData.geography || "");
              setCategory(initialData.category || "");
              setDescription(initialData.description || "");
            }
          } catch (error) {
            console.error("Error fetching latest project data:", error);
            // Fallback to initialData if fetch fails
            setProjectTypeId(initialData.project_type_id || "");
            setClientName(initialData.client_name || "");
            setName(initialData.name || "");
            setStatus(initialData.status || "active");
            setGeography(initialData.geography || "");
            setCategory(initialData.category || "");
            setDescription(initialData.description || "");
          }
        };

        fetchLatestData();
      } else {
        // Reset to defaults for create mode; pre-select project type when provided (e.g. niche from filtered list)
        setProjectTypeId(initialProjectTypeId || "");
        setClientName("");
        setName("");
        setStatus("active");
        setGeography("");
        setCategory("");
        setDescription("");
      }
      setErrors({});
    }
  }, [initialData?.id, initialProjectTypeId, open]);

  const handleSubmit = async () => {
    const newErrors: Record<string, string> = {};

    // Validate project type
    if (!projectTypeId) {
      newErrors.projectTypeId = "Project type is required";
    }

    // Validate based on project type
    if (isClientType) {
      if (!clientName.trim()) {
        newErrors.clientName = "Client name is required";
      }
      if (!status) {
        newErrors.status = "Please select a status";
      }
    } else if (isNicheType) {
      if (!name.trim()) {
        newErrors.name = "Name is required";
      }
      if (!projectTypeId) {
        newErrors.projectTypeId = "Project type is required";
      }
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

      // Prepare payload based on project type
      const payload: any = {
        project_type_id: projectTypeId,
        description: description || null,
      };

      if (isClientType) {
        payload.client_name = clientName.trim();
        payload.status = status;
        payload.type = "client";
      } else if (isNicheType) {
        payload.name = name.trim();
        payload.geography = geography?.trim() || null;
        payload.category = category?.trim() || null;
        payload.type = "niche_research";
        payload.status = "active"; // Default for niche research
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Failed to ${isEdit ? "update" : "create"} project`);
      }

      const result = await response.json();
      toast.success(`Project ${isEdit ? "updated" : "created"} successfully`);
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      handleClose();
      
      if (isEdit) {
        router.refresh();
      } else {
        // Only navigate if onSuccess callback is not provided
        // This allows parent components to handle navigation/refresh themselves
        if (!onSuccess) {
          router.push(`/intel/projects/${result.id}`);
        }
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
    setProjectTypeId("");
    setClientName("");
    setName("");
    setStatus("active");
    setGeography("");
    setCategory("");
    setDescription("");
    setErrors({});
    onOpenChange(false);
  };

  const title = isEdit
    ? (isClientType ? clientName : name) || "Edit Project"
    : "Create Project";

  return (
    <ModalShell
      open={open}
      onOpenChange={handleClose}
      title={title}
      titleIcon={<FontAwesomeIcon icon={faFolderOpen} className="w-5 h-5 md:w-6 md:h-6" />}
      description="Configure project type and details"
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
                ? "Update Project"
                : "Create Project"}
          </Button>
        </DialogFooter>
      }
    >
      <div className="space-y-4 md:space-y-5">
        {/* Project Type */}
        <div className="space-y-1.5 md:space-y-2">
          <Label htmlFor="project-type" className="text-sm">
            Project Type <span className="text-destructive">*</span>
          </Label>
          <RAGSelect
            value={projectTypeId}
            onValueChange={(value) => {
              setProjectTypeId(value);
              if (errors.projectTypeId) {
                const { projectTypeId: _, ...rest } = errors;
                setErrors(rest);
              }
            }}
            disabled={loadingProjectTypes || isEdit}
          >
            <RAGSelectTrigger
              id="project-type"
              error={!!errors.projectTypeId}
            >
              <RAGSelectValue placeholder={loadingProjectTypes ? "Loading..." : "Select project type"} />
            </RAGSelectTrigger>
            <RAGSelectContent>
              {projectTypes.map((pt) => (
                <RAGSelectItem key={pt.id} value={pt.id}>
                  {pt.icon ? `${pt.icon} ` : ""}{pt.label}
                </RAGSelectItem>
              ))}
            </RAGSelectContent>
          </RAGSelect>
          {errors.projectTypeId && (
            <p className="text-xs text-destructive">{errors.projectTypeId}</p>
          )}
        </div>

        {/* Client Type Fields */}
        {isClientType && (
          <div className="space-y-4 md:space-y-5 pt-3 md:pt-0 border-t border-border/50 md:border-t-0">
            {/* Client Name */}
            <div className="space-y-1.5 md:space-y-2">
              <Label htmlFor="client-name" className="text-sm">
                Client Name <span className="text-destructive">*</span>
              </Label>
              <RAGInput
                id="client-name"
                placeholder="e.g., Acme Corporation"
                value={clientName}
                onChange={(e) => {
                  setClientName(e.target.value);
                  if (errors.clientName) {
                    const { clientName: _, ...rest } = errors;
                    setErrors(rest);
                  }
                }}
                error={!!errors.clientName}
                autoComplete="off"
              />
              {errors.clientName && (
                <p className="text-xs text-destructive">{errors.clientName}</p>
              )}
            </div>

            {/* Project Status */}
            <div className="space-y-1.5 md:space-y-2">
              <Label htmlFor="project-status" className="text-sm">
                Project Status <span className="text-destructive">*</span>
              </Label>
              <RAGSelect
                value={status}
                onValueChange={(value) => {
                  setStatus(value as "active" | "onboarding" | "delivered" | "archived");
                  if (errors.status) {
                    const { status: _, ...rest } = errors;
                    setErrors(rest);
                  }
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
          </div>
        )}

        {/* Niche Research Type Fields */}
        {isNicheType && (
          <div className="space-y-4 md:space-y-5 pt-3 md:pt-0 border-t border-border/50 md:border-t-0">
            {/* Name */}
            <div className="space-y-1.5 md:space-y-2">
              <Label htmlFor="name" className="text-sm">
                Name <span className="text-destructive">*</span>
              </Label>
              <RAGInput
                id="name"
                placeholder="e.g., 3PL Providers"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) {
                    const { name: _, ...rest } = errors;
                    setErrors(rest);
                  }
                }}
                error={!!errors.name}
                autoComplete="off"
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name}</p>
              )}
            </div>

            {/* Geography */}
            <div className="space-y-1.5 md:space-y-2">
              <Label htmlFor="geography" className="text-sm">Geography</Label>
              <RAGInput
                id="geography"
                placeholder="e.g., United States"
                value={geography}
                onChange={(e) => setGeography(e.target.value)}
                autoComplete="off"
              />
            </div>

            {/* Category */}
            <div className="space-y-1.5 md:space-y-2">
              <Label htmlFor="category" className="text-sm">Category</Label>
              <RAGInput
                id="category"
                placeholder="e.g., Logistics"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                autoComplete="off"
              />
            </div>
          </div>
        )}

        {/* Description */}
        <div className="space-y-1.5 md:space-y-2 pt-2 md:pt-0 border-t border-border/50 md:border-t-0">
          <Label htmlFor="project-description" className="text-sm">Description</Label>
          <RAGTextarea
            id="project-description"
            placeholder="Describe the project goals, scope, and expected outcomes..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="min-h-[80px] md:min-h-[120px]"
          />
        </div>
      </div>
    </ModalShell>
  );
}


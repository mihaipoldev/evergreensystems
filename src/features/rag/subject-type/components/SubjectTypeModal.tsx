"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faX,
  faPlus,
  faSitemap,
  faArrowUp,
  faArrowDown,
} from "@fortawesome/free-solid-svg-icons";
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
import type { SubjectType } from "../types";
import type { Workflow } from "@/features/rag/workflows/types";

interface SubjectTypeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: SubjectType | null;
  onSuccess?: (updatedData: SubjectType) => void;
}

export function SubjectTypeModal({
  open,
  onOpenChange,
  initialData,
  onSuccess,
}: SubjectTypeModalProps) {
  const router = useRouter();
  const isEdit = !!initialData;
  const [name, setName] = useState("");
  const [label, setLabel] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("");
  const [enabled, setEnabled] = useState(true);
  const [errors, setErrors] = useState<{ name?: string; label?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Workflow linking state
  type SelectedWorkflow = {
    id: string;
    workflow_id: string;
    display_order: number;
    workflow: Workflow;
  };
  const [selectedWorkflows, setSelectedWorkflows] = useState<SelectedWorkflow[]>([]);
  const [isLoadingWorkflows, setIsLoadingWorkflows] = useState(false);
  const [availableWorkflows, setAvailableWorkflows] = useState<Workflow[]>([]);
  const [isLoadingAvailableWorkflows, setIsLoadingAvailableWorkflows] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);

  // Fetch available workflows
  useEffect(() => {
    if (open) {
      const fetchAvailableWorkflows = async () => {
        setIsLoadingAvailableWorkflows(true);
        try {
          const supabase = createClient();
          const { data: sessionData } = await supabase.auth.getSession();
          const accessToken = sessionData?.session?.access_token;

          const response = await fetch("/api/intel/workflows?enabled=true", {
            headers: {
              ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
            },
          });

          if (response.ok) {
            const data = await response.json();
            setAvailableWorkflows(data || []);
          }
        } catch (error) {
          console.error("Error fetching available workflows:", error);
        } finally {
          setIsLoadingAvailableWorkflows(false);
        }
      };

      fetchAvailableWorkflows();
    }
  }, [open]);

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

            const response = await fetch(`/api/intel/subject-types/${initialData.id}`, {
              headers: {
                ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
              },
            });

            if (response.ok) {
              const latestData = await response.json();
              setName(latestData.name || "");
              setLabel(latestData.label || "");
              setDescription(latestData.description || "");
              setIcon(latestData.icon || "");
              setEnabled(latestData.enabled !== undefined ? latestData.enabled : true);

              // Fetch existing workflows for this subject type
              setIsLoadingWorkflows(true);
              try {
                const workflowsResponse = await fetch(
                  `/api/intel/subject-types/workflows?subject_type=${encodeURIComponent(latestData.name)}`,
                  {
                    headers: {
                      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
                    },
                  }
                );

                if (workflowsResponse.ok) {
                  const workflowsData = await workflowsResponse.json();
                  const workflows: SelectedWorkflow[] = (workflowsData || []).map(
                    (wf: Workflow & { display_order?: number }, index: number) => ({
                      id: wf.id,
                      workflow_id: wf.id,
                      display_order: wf.display_order ?? index,
                      workflow: wf,
                    })
                  );
                  setSelectedWorkflows(workflows);
                }
              } catch (error) {
                console.error("Error fetching workflows:", error);
              } finally {
                setIsLoadingWorkflows(false);
              }
            } else {
              // Fallback to initialData if fetch fails
              setName(initialData.name || "");
              setLabel(initialData.label || "");
              setDescription(initialData.description || "");
              setIcon(initialData.icon || "");
              setEnabled(initialData.enabled !== undefined ? initialData.enabled : true);
            }
          } catch (error) {
            console.error("Error fetching latest subject type data:", error);
            // Fallback to initialData if fetch fails
            setName(initialData.name || "");
            setLabel(initialData.label || "");
            setDescription(initialData.description || "");
            setIcon(initialData.icon || "");
            setEnabled(initialData.enabled !== undefined ? initialData.enabled : true);
          }
        };

        fetchLatestData();
      } else {
        // Reset to defaults for create mode
        setName("");
        setLabel("");
        setDescription("");
        setIcon("");
        setEnabled(true);
        setSelectedWorkflows([]);
      }
      setErrors({});
    }
  }, [initialData?.id, open]);

  const handleSubmit = async () => {
    const newErrors: { name?: string; label?: string } = {};

    if (!name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!label.trim()) {
      newErrors.label = "Label is required";
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
        ? `/api/intel/subject-types/${initialData!.id}`
        : "/api/intel/subject-types";
      const method = isEdit ? "PUT" : "POST";

      // Save subject type
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({
          name: name.trim(),
          label: label.trim(),
          description: description.trim() || null,
          icon: icon.trim() || null,
          enabled,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Failed to ${isEdit ? "update" : "create"} subject type`);
      }

      const result = await response.json();

      // If editing, save workflow associations
      if (isEdit) {
        const workflowsPayload = selectedWorkflows.map((sw, index) => ({
          workflow_id: sw.workflow_id,
          display_order: index,
        }));

        const workflowsResponse = await fetch(
          `/api/intel/subject-types/${initialData!.id}/workflows`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
            },
            body: JSON.stringify({
              workflows: workflowsPayload,
            }),
          }
        );

        if (!workflowsResponse.ok) {
          const error = await workflowsResponse.json();
          throw new Error(error.error || "Failed to update workflow associations");
        }
      }

      toast.success(`Subject type ${isEdit ? "updated" : "created"} successfully`);
      
      if (isEdit && onSuccess) {
        onSuccess(result);
      }
      
      handleClose();
      
      router.refresh();
    } catch (error: any) {
      console.error(`Error ${isEdit ? "updating" : "creating"} subject type:`, error);
      toast.error(error.message || `Failed to ${isEdit ? "update" : "create"} subject type`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setName("");
    setLabel("");
    setDescription("");
    setIcon("");
    setEnabled(true);
    setErrors({});
    setSelectedWorkflows([]);
    setPopoverOpen(false);
    onOpenChange(false);
  };

  // Workflow management handlers
  const handleAddWorkflow = (workflowId: string) => {
    const workflow = availableWorkflows.find((w) => w.id === workflowId);
    if (!workflow) return;

    const newWorkflow: SelectedWorkflow = {
      id: workflowId,
      workflow_id: workflowId,
      display_order: selectedWorkflows.length,
      workflow,
    };

    setSelectedWorkflows([...selectedWorkflows, newWorkflow]);
    setPopoverOpen(false);
  };

  const handleRemoveWorkflow = (workflowId: string) => {
    setSelectedWorkflows((prev) =>
      prev.filter((sw) => sw.workflow_id !== workflowId).map((sw, index) => ({
        ...sw,
        display_order: index,
      }))
    );
  };

  const handleMoveWorkflow = (workflowId: string, direction: "up" | "down") => {
    setSelectedWorkflows((prev) => {
      const index = prev.findIndex((sw) => sw.workflow_id === workflowId);
      if (index === -1) return prev;
      
      const newIndex = direction === "up" ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= prev.length) return prev;
      
      const newWorkflows = [...prev];
      [newWorkflows[index], newWorkflows[newIndex]] = [newWorkflows[newIndex], newWorkflows[index]];
      
      return newWorkflows.map((sw, idx) => ({
        ...sw,
        display_order: idx,
      }));
    });
  };

  // Get available workflows (not already selected)
  const availableWorkflowsForSelection = useMemo(() => {
    const selectedIds = new Set(selectedWorkflows.map((sw) => sw.workflow_id));
    return availableWorkflows.filter((w) => !selectedIds.has(w.id));
  }, [availableWorkflows, selectedWorkflows]);

  // Render workflow content
  const renderWorkflowContent = useCallback(
    (item: SelectedWorkflow) => {
      const wf = item.workflow;
      return (
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            {wf.icon ? (
              <span className="text-lg">{wf.icon}</span>
            ) : (
              <FontAwesomeIcon
                icon={faSitemap}
                className="h-4 w-4 text-primary"
              />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-foreground truncate">{wf.label}</div>
            {wf.description && (
              <div className="text-sm text-muted-foreground truncate">
                {wf.description}
              </div>
            )}
          </div>
        </div>
      );
    },
    []
  );

  // Render workflow actions (move up/down and remove buttons)
  const renderWorkflowActions = useCallback(
    (item: SelectedWorkflow, index: number) => {
      return (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={(e) => {
              e.stopPropagation();
              handleMoveWorkflow(item.workflow_id, "up");
            }}
            disabled={index === 0}
          >
            <FontAwesomeIcon icon={faArrowUp} className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={(e) => {
              e.stopPropagation();
              handleMoveWorkflow(item.workflow_id, "down");
            }}
            disabled={index === selectedWorkflows.length - 1}
          >
            <FontAwesomeIcon icon={faArrowDown} className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              handleRemoveWorkflow(item.workflow_id);
            }}
          >
            <FontAwesomeIcon icon={faX} className="h-4 w-4" />
          </Button>
        </div>
      );
    },
    [selectedWorkflows.length]
  );

  return (
    <RAGModal
      open={open}
      onOpenChange={handleClose}
      title={isEdit ? "Edit Subject Type" : "Create Subject Type"}
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
                ? "Update Subject Type"
                : "Create Subject Type"}
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="subject-type-name">
            Name <span className="text-destructive">*</span>
          </Label>
          <RAGInput
            id="subject-type-name"
            placeholder="e.g., niche, client, internal"
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

        {/* Label */}
        <div className="space-y-2">
          <Label htmlFor="subject-type-label">
            Label <span className="text-destructive">*</span>
          </Label>
          <RAGInput
            id="subject-type-label"
            placeholder="e.g., Niche Research, Client Projects"
            value={label}
            onChange={(e) => {
              setLabel(e.target.value);
              if (errors.label) setErrors({ ...errors, label: undefined });
            }}
            error={!!errors.label}
          />
          {errors.label && (
            <p className="text-xs text-destructive">{errors.label}</p>
          )}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="subject-type-description">Description</Label>
          <RAGTextarea
            id="subject-type-description"
            placeholder="Describe this subject type..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>

        {/* Icon */}
        <div className="space-y-2">
          <Label htmlFor="subject-type-icon">Icon</Label>
          <RAGInput
            id="subject-type-icon"
            placeholder="e.g., 📊, 📁, 🏢"
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
          />
        </div>

        {/* Enabled */}
        <div className="space-y-2">
          <Label htmlFor="subject-type-enabled">Status</Label>
          <RAGSelect
            value={enabled ? "enabled" : "disabled"}
            onValueChange={(value) => {
              setEnabled(value === "enabled");
            }}
          >
            <RAGSelectTrigger id="subject-type-enabled">
              <RAGSelectValue placeholder="Select status" />
            </RAGSelectTrigger>
            <RAGSelectContent>
              <RAGSelectItem value="enabled">Enabled</RAGSelectItem>
              <RAGSelectItem value="disabled">Disabled</RAGSelectItem>
            </RAGSelectContent>
          </RAGSelect>
        </div>

        {/* Workflow Linking Section - Only in edit mode */}
        {isEdit && (
          <div className="space-y-3 pt-2 border-t">
            <Label>Linked Workflows</Label>
            
            {isLoadingWorkflows ? (
              <div className="text-sm text-muted-foreground py-4 text-center">
                Loading workflows...
              </div>
            ) : selectedWorkflows.length > 0 ? (
              <div className="space-y-2">
                {selectedWorkflows.map((workflow, index) => (
                  <div
                    key={workflow.workflow_id}
                    className="flex items-center gap-4 rounded-xl border border-border/60 bg-card p-4"
                  >
                    <div className="flex-1 min-w-0">
                      {renderWorkflowContent(workflow)}
                    </div>
                    <div className="shrink-0">
                      {renderWorkflowActions(workflow, index)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground py-4 text-center border border-dashed rounded-lg">
                No workflows linked yet
              </div>
            )}

            <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  disabled={isLoadingAvailableWorkflows || availableWorkflowsForSelection.length === 0}
                >
                  <FontAwesomeIcon icon={faPlus} className="h-4 w-4 mr-2" />
                  Connect Workflow
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-1 z-[110]" align="start">
                {isLoadingAvailableWorkflows ? (
                  <div className="p-4 text-sm text-muted-foreground text-center">
                    Loading workflows...
                  </div>
                ) : availableWorkflowsForSelection.length === 0 ? (
                  <div className="p-4 text-sm text-muted-foreground text-center">
                    No available workflows
                  </div>
                ) : (
                  <div className="max-h-[300px] overflow-y-auto">
                    {availableWorkflowsForSelection.map((workflow) => (
                      <button
                        key={workflow.id}
                        type="button"
                        onClick={() => handleAddWorkflow(workflow.id)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground transition-colors text-left"
                      >
                        {workflow.icon && (
                          <span className="text-base shrink-0">{workflow.icon}</span>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{workflow.label}</div>
                          {workflow.description && (
                            <div className="text-xs text-muted-foreground truncate">
                              {workflow.description}
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </PopoverContent>
            </Popover>
          </div>
        )}
      </div>
    </RAGModal>
  );
}


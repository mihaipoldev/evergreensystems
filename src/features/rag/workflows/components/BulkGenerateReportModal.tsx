"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faSpinner, faCheckCircle, faExclamationCircle, faWandSparkles } from "@fortawesome/free-solid-svg-icons";
import { cn } from "@/lib/utils";
import type { Project } from "@/features/rag/projects/types";
import { WorkflowSelectionCard } from "./WorkflowSelectionCard";
import type { Workflow as WorkflowType } from "../types";

interface BulkGenerateReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedProjects: Project[];
  projectType: string | null;
  projectTypeId?: string | null;
  onComplete?: () => void;
}

interface GenerationStatus {
  projectId: string;
  projectName: string;
  status: "pending" | "processing" | "success" | "error";
  error?: string;
}

// Workflow interface matches the one from types.ts

export function BulkGenerateReportModal({
  open,
  onOpenChange,
  selectedProjects,
  projectType,
  projectTypeId,
  onComplete,
}: BulkGenerateReportModalProps) {
  const [statuses, setStatuses] = useState<GenerationStatus[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [workflowId, setWorkflowId] = useState<string | null>(null);
  const [workflows, setWorkflows] = useState<WorkflowType[]>([]);
  const [isLoadingWorkflows, setIsLoadingWorkflows] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const fetchInProgressRef = useRef(false);
  const workflowsLoadedRef = useRef(false);

  // Initialize statuses when projects change
  useEffect(() => {
    if (selectedProjects.length > 0) {
      setStatuses(
        selectedProjects.map((project) => ({
          projectId: project.id,
          projectName: project.client_name || project.name || "Unknown",
          status: "pending" as const,
        }))
      );
    }
  }, [selectedProjects]);

  // Get project type ID from selected projects if not provided
  // Check if all selected projects have the same project type ID
  // Memoize to prevent unnecessary recalculations
  const effectiveProjectTypeId = useMemo(() => {
    if (projectTypeId) return projectTypeId;
    
    if (selectedProjects.length === 0) return null;
    
    // Get unique project type IDs from selected projects
    const projectTypeIds = selectedProjects
      .map((p) => p.project_type_id)
      .filter((id): id is string => id !== null && id !== undefined);
    
    if (projectTypeIds.length === 0) return null;
    
    // Check if all projects have the same project type ID
    const uniqueIds = Array.from(new Set(projectTypeIds));
    if (uniqueIds.length === 1) {
      return uniqueIds[0];
    }
    
    // Multiple project types - this shouldn't happen with bulk selection, but handle gracefully
    console.warn("Selected projects have different project types:", uniqueIds);
    return null;
  }, [projectTypeId, selectedProjects]);

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setWorkflows([]);
      setWorkflowId(null);
      setIsLoadingWorkflows(false);
      setShowConfig(false);
      fetchInProgressRef.current = false;
      workflowsLoadedRef.current = false;
    }
  }, [open]);

  // Fetch all workflows on open
  useEffect(() => {
    // Only run when modal is actually open
    if (!open) {
      return;
    }

    // Wait for selectedProjects to be populated
    if (!selectedProjects || selectedProjects.length === 0) {
      console.log("Waiting for selectedProjects to be populated...", { 
        selectedProjectsLength: selectedProjects?.length,
        projectTypeId 
      });
      return;
    }

    if (!effectiveProjectTypeId) {
      console.warn("No project type ID available for fetching workflows", { 
        projectTypeId, 
        selectedProjects: selectedProjects.map(p => ({ id: p.id, project_type_id: p.project_type_id }))
      });
      setIsLoadingWorkflows(false);
      toast.error("Unable to determine project type. Please select projects with the same project type.");
      return;
    }

    // Prevent duplicate fetches
    if (fetchInProgressRef.current) {
      console.log("Fetch already in progress, skipping");
      return;
    }
    
    // If we already successfully loaded workflows in this session, don't fetch again
    if (workflowsLoadedRef.current) {
      console.log("Workflows already loaded in this session, skipping fetch");
      return;
    }

    // Fetch workflows inline to ensure we use the latest effectiveProjectTypeId
    const fetchWorkflows = async () => {
      // Prevent duplicate fetches
      if (fetchInProgressRef.current) {
        console.log("Fetch already in progress, skipping...");
        return;
      }

      console.log("Fetching workflows for project type ID:", effectiveProjectTypeId, "with", selectedProjects.length, "projects");
      fetchInProgressRef.current = true;
      setIsLoadingWorkflows(true);
    try {
      const supabase = createClient();
      
      // Step 1: Get workflow IDs from the junction table
      const { data: junctionData, error: junctionError } = await supabase
        .from("project_type_workflows")
        .select("workflow_id, display_order")
        .eq("project_type_id", effectiveProjectTypeId)
        .order("display_order", { ascending: true });

      console.log("Junction data:", junctionData);
      console.log("Junction error:", junctionError);

      if (junctionError) {
        console.error("Error fetching junction data:", junctionError);
        throw junctionError;
      }

      if (!junctionData || junctionData.length === 0) {
        console.warn("No workflows linked to this project type");
        setWorkflows([]);
        setWorkflowId(null);
        toast.warning("No workflows found for this project type.");
        return;
      }

      // Step 2: Get workflow details (include all fields needed for WorkflowSelectionCard)
      const workflowIds = junctionData.map((item: any) => item.workflow_id);
      const { data: workflowsData, error: workflowsError } = await supabase
        .from("workflows")
        .select("id, slug, name, description, icon, enabled, estimated_cost, estimated_time_minutes, input_schema, default_ai_model, default_synthesis_ai_model, knowledge_base_target, target_knowledge_base_id, created_at, updated_at")
        .in("id", workflowIds)
        .eq("enabled", true);

      console.log("Workflows data:", workflowsData);
      console.log("Workflows error:", workflowsError);

      if (workflowsError) {
        console.error("Error fetching workflows:", workflowsError);
        throw workflowsError;
      }

      if (!workflowsData || workflowsData.length === 0) {
        console.warn("No enabled workflows found");
        setWorkflows([]);
        setWorkflowId(null);
        toast.warning("No enabled workflows found for this project type.");
        return;
      }

      // Step 3: Combine and sort by display_order
      const workflowMap = new Map(workflowsData.map((w: any) => [w.id, w]));
      const workflowsList: WorkflowType[] = junctionData
        .map((item: any) => {
          const workflow = workflowMap.get(item.workflow_id);
          if (workflow) {
            return {
              id: workflow.id,
              slug: workflow.slug,
              name: workflow.name || workflow.slug,
              description: workflow.description,
              icon: workflow.icon,
              estimated_cost: workflow.estimated_cost,
              estimated_time_minutes: workflow.estimated_time_minutes,
              input_schema: workflow.input_schema,
              default_ai_model: workflow.default_ai_model || null,
              default_synthesis_ai_model: workflow.default_synthesis_ai_model || null,
              enabled: workflow.enabled,
              knowledge_base_target: workflow.knowledge_base_target || 'workspace',
              target_knowledge_base_id: workflow.target_knowledge_base_id,
              created_at: workflow.created_at || new Date().toISOString(),
              updated_at: workflow.updated_at || new Date().toISOString(),
            } as WorkflowType;
          }
          return null;
        })
        .filter((w): w is WorkflowType => w !== null);
      
      console.log("Final workflows list:", workflowsList);
      
      if (workflowsList.length > 0) {
        console.log("Setting workflows state with", workflowsList.length, "workflows");
        // Use functional update to ensure state is set correctly
        setWorkflows(() => {
          console.log("State update function called with", workflowsList.length, "workflows");
          return workflowsList;
        });
        // Auto-select first workflow (ordered by display_order)
        setWorkflowId(workflowsList[0].id);
        workflowsLoadedRef.current = true; // Mark as loaded
        console.log("Workflows state should be updated now");
      } else {
        console.warn("No workflows found after processing");
        setWorkflows([]);
        setWorkflowId(null);
        workflowsLoadedRef.current = true; // Mark as loaded even if empty
        toast.warning("No workflows found for this project type.");
      }
    } catch (error) {
      console.error("Error fetching workflows:", error);
      toast.error("Failed to load workflows");
    } finally {
      setIsLoadingWorkflows(false);
      fetchInProgressRef.current = false;
    }
    };

    fetchWorkflows();
  }, [open, effectiveProjectTypeId, selectedProjects.length]);

  const handleGenerate = async () => {
    if (!workflowId) {
      toast.error("No workflow available. Please configure workflows first.");
      return;
    }

    setIsGenerating(true);

    // Update all to processing initially
    setStatuses((prev) =>
      prev.map((s) => ({ ...s, status: "processing" as const }))
    );

    const supabase = createClient();
    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData?.session?.access_token;

    // Generate reports sequentially
    for (let i = 0; i < selectedProjects.length; i++) {
      const project = selectedProjects[i];
      
      try {
        setStatuses((prev) =>
          prev.map((s, idx) =>
            idx === i ? { ...s, status: "processing" as const } : s
          )
        );

        const response = await fetch(`/api/intel/workflows/${workflowId}/execute`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          },
          body: JSON.stringify({
            project_id: project.id,
            research_subject_id: project.id,
            research_subject_name: project.client_name || project.name || "",
            research_subject_geography: project.geography || null,
            research_subject_description: project.description || null,
            research_subject_category: project.category || null,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to generate report");
        }

        setStatuses((prev) =>
          prev.map((s, idx) =>
            idx === i ? { ...s, status: "success" as const } : s
          )
        );
      } catch (error: any) {
        console.error(`Error generating report for ${project.client_name}:`, error);
        setStatuses((prev) =>
          prev.map((s, idx) =>
            idx === i
              ? {
                  ...s,
                  status: "error" as const,
                  error: error.message || "Failed to generate report",
                }
              : s
          )
        );
      }
    }

    setIsGenerating(false);
    
    // Wait a bit for final state updates, then show summary
    setTimeout(() => {
      const successCount = statuses.filter((s) => s.status === "success").length;
      const errorCount = statuses.filter((s) => s.status === "error").length;

      if (errorCount === 0) {
        toast.success(`Successfully generated ${successCount} report(s)`);
      } else {
        toast.warning(`Generated ${successCount} report(s), ${errorCount} failed`);
      }

      // Close modal and reset state
      setStatuses([]);
      setIsGenerating(false);
      setWorkflowId(null);
      setWorkflows([]);
      setShowConfig(false);
      fetchInProgressRef.current = false;
      onOpenChange(false);

      // Call onComplete after a short delay to ensure modal is closed
      if (onComplete) {
        setTimeout(() => {
          onComplete();
        }, 100);
      }
    }, 200);
  };

  const handleClose = () => {
    if (!isGenerating) {
      // Reset state immediately before closing
      setStatuses([]);
      setIsGenerating(false);
      setWorkflowId(null);
      setWorkflows([]);
      setShowConfig(false);
      fetchInProgressRef.current = false;
      onOpenChange(false);
    }
  };

  const selectedWorkflow = workflows.find((w) => w.id === workflowId);

  // Early return - don't render anything if modal is closed
  if (!open) {
    return null;
  }

  const modalContent = (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-background/80 backdrop-blur-md z-[100]"
        onClick={handleClose}
      />

      {/* Modal Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="fixed inset-0 z-[100] flex items-center justify-center md:p-4 pointer-events-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="w-full h-full md:w-full md:max-w-2xl md:h-auto md:max-h-[90vh] flex flex-col overflow-hidden md:rounded-2xl bg-card border-0 md:border border-border pointer-events-auto"
          style={{ boxShadow: "0 20px 60px -12px hsl(var(--primary) / 0.3)" }}
        >
          {/* Header */}
          <div className="flex-shrink-0 p-4 md:p-6 border-b border-border/50">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0"
                >
                  <FontAwesomeIcon icon={faWandSparkles} className="w-5 h-5 md:w-6 md:h-6" />
                </motion.div>
                <div className="min-w-0 flex-1">
                  <h1
                    className="text-lg md:text-2xl font-bold leading-tight"
                    style={{
                      background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)))",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    Generate Intelligence Reports
                  </h1>
                  <p className="text-xs md:text-sm text-muted-foreground mt-1 hidden md:block">
                    Generate reports for {selectedProjects.length} project{selectedProjects.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleClose}
                disabled={isGenerating}
                className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                aria-label="Close modal"
              >
                <FontAwesomeIcon icon={faTimes} className="w-4 h-4 md:w-5 md:h-5" />
              </motion.button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-4 md:pb-6 min-h-0">
            {!isGenerating && statuses.length === 0 && (
              <>
                {isLoadingWorkflows ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FontAwesomeIcon icon={faSpinner} className="w-6 h-6 animate-spin mx-auto mb-2" />
                    <p>Loading workflows...</p>
                  </div>
                ) : workflows.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border/60 bg-muted/30 p-6 md:p-8 text-center text-muted-foreground text-sm md:text-base">
                    No workflows available for this project type.
                  </div>
                ) : (
                  <>
                    {/* Workflow Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mb-4 md:mb-6">
                      {workflows.map((workflow) => (
                        <WorkflowSelectionCard
                          key={workflow.id}
                          workflow={workflow}
                          isSelected={workflowId === workflow.id}
                          onSelect={() => {
                            setWorkflowId(workflow.id);
                            setShowConfig(false); // Close config when selecting a different workflow
                          }}
                          onConfigClick={() => {
                            if (workflowId === workflow.id) {
                              setShowConfig(!showConfig);
                            }
                          }}
                        />
                      ))}
                    </div>

                    {/* Generate Button - Always visible */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleGenerate}
                      disabled={!workflowId || isLoadingWorkflows}
                      className={cn(
                        "w-full py-3.5 md:py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all",
                        "bg-primary text-primary-foreground",
                        "disabled:opacity-50 disabled:cursor-not-allowed",
                        "hover:bg-primary/90 active:bg-primary/95",
                        "touch-manipulation"
                      )}
                    >
                      {isGenerating ? (
                        <>
                          <FontAwesomeIcon icon={faSpinner} className="w-4 h-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <FontAwesomeIcon icon={faWandSparkles} className="w-4 h-4" />
                          Generate Reports for {selectedProjects.length} Project{selectedProjects.length !== 1 ? "s" : ""}
                        </>
                      )}
                    </motion.button>
                  </>
                )}
              </>
            )}

            {(isGenerating || statuses.some((s) => s.status !== "pending")) && (
              <div className="space-y-2">
                {statuses.map((status, index) => (
                  <div
                    key={status.projectId}
                    className={cn(
                      "p-3 md:p-4 rounded-lg border flex items-center gap-2 md:gap-3",
                      status.status === "success" && "border-green-500/50 bg-green-500/10",
                      status.status === "error" && "border-red-500/50 bg-red-500/10",
                      status.status === "processing" && "border-primary/50 bg-primary/10",
                      status.status === "pending" && "border-border bg-muted/30"
                    )}
                  >
                    <div className="flex-shrink-0">
                      {status.status === "success" && (
                        <FontAwesomeIcon
                          icon={faCheckCircle}
                          className="w-5 h-5 text-green-500"
                        />
                      )}
                      {status.status === "error" && (
                        <FontAwesomeIcon
                          icon={faExclamationCircle}
                          className="w-5 h-5 text-red-500"
                        />
                      )}
                      {status.status === "processing" && (
                        <FontAwesomeIcon
                          icon={faSpinner}
                          className="w-5 h-5 text-primary animate-spin"
                        />
                      )}
                      {status.status === "pending" && (
                        <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {status.projectName}
                      </p>
                      {status.error && (
                        <p className="text-xs text-red-500 mt-1">{status.error}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </>
  );

  // Render modal in a portal at document body level
  if (typeof window === "undefined") return null;
  
  return createPortal(modalContent, document.body);
}


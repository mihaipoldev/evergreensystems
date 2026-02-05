"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBrain,
  faGlobe,
  faArrowRight,
  faEllipsis,
} from "@fortawesome/free-solid-svg-icons";
import { CircularProgress } from "@/features/rag/runs/components/CircularProgress";
import { ProgressTimeline } from "@/features/rag/runs/components/ProgressTimeline";
import type { Run } from "@/features/rag/runs/types";
import { getRunLabel } from "@/features/rag/runs/types";
import { createClient } from "@/lib/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { ActionMenu } from "@/components/shared/ActionMenu";
import { DeleteConfirmationDialog } from "@/features/rag/shared/components/DeleteConfirmationDialog";
import { toast } from "sonner";
import { faExternalLink, faFileAlt, faTrash } from "@fortawesome/free-solid-svg-icons";
import { usePageHeader } from "@/providers/PageHeaderProvider";

type RunWithExtras = Run & {
  knowledge_base_name?: string | null;
  workflow_name?: string | null;
  workflow_label?: string | null;
};

type RunDetailClientProps = {
  run: RunWithExtras;
};

/**
 * Calculate time difference and format as "Xm Ys" or "Xs"
 */
function formatDuration(start: string, end: string | null | undefined): string {
  if (!start) return "0s";
  const startTime = new Date(start).getTime();
  const endTime = end ? new Date(end).getTime() : Date.now();
  const diffMs = endTime - startTime;
  const diffSeconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(diffSeconds / 60);
  const seconds = diffSeconds % 60;
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
}

/**
 * Estimate remaining time based on elapsed time and progress
 */
function estimateRemaining(
  elapsed: string,
  progress: number
): string {
  if (progress === 0) return "Calculating...";
  if (progress >= 100) return "Complete";
  
  // Parse elapsed time
  const elapsedMatch = elapsed.match(/(\d+)m\s*(\d+)s/);
  if (!elapsedMatch) return "Calculating...";
  
  const elapsedMinutes = parseInt(elapsedMatch[1] || "0", 10);
  const elapsedSeconds = parseInt(elapsedMatch[2] || "0", 10);
  const totalElapsedSeconds = elapsedMinutes * 60 + elapsedSeconds;
  
  // Estimate: if we've done X% in Y seconds, remaining is (100-X)/X * Y
  const remainingSeconds = Math.round((totalElapsedSeconds / progress) * (100 - progress));
  const remainingMinutes = Math.floor(remainingSeconds / 60);
  const remainingSecs = remainingSeconds % 60;
  
  if (remainingMinutes > 0) {
    return `~${remainingMinutes}m ${remainingSecs}s`;
  }
  return `~${remainingSecs}s`;
}

/**
 * Get status message based on current step
 */
function getStatusMessage(
  currentStep: string,
  workflowLabel: string | null,
  metadata: Record<string, any>
): string {
  if (currentStep === "complete") {
    return "Run completed successfully";
  }
  
  const stepNames: Record<string, string> = {
    market_analyst: "Analyzing market data...",
    buyer_intelligence: "Gathering buyer intelligence...",
    strategic_evaluator: "Evaluating strategic opportunities...",
    tactical_planner: "Developing tactical plans...",
    market_positioning: "Analyzing market positioning...",
  };
  
  const workflowName = workflowLabel || "workflow";
  return stepNames[currentStep] || `Processing ${workflowName}...`;
}

export function RunDetailClient({ run: initialRun }: RunDetailClientProps) {
  const router = useRouter();
  const { setHeader } = usePageHeader();
  const [run, setRun] = useState<RunWithExtras>(initialRun);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Sync initial run prop if it changes
  useEffect(() => {
    setRun(initialRun);
  }, [initialRun]);

  // Set up Supabase real-time subscription for run updates with polling fallback
  useEffect(() => {
    const supabase = createClient();
    let pollInterval: NodeJS.Timeout | null = null;
    let channel: RealtimeChannel | null = null;
    let reconnectTimeout: NodeJS.Timeout | null = null;
    let isUnmounted = false;
    
    // Function to fetch and update run data via API route (bypasses RLS)
    const fetchRunUpdate = async () => {
      try {
        const response = await fetch(`/api/intel/runs/${initialRun.id}`);
        
        if (!response.ok) {
          // If we can't access the run (404, 401, etc.), stop polling
          if (response.status === 404 || response.status === 401 || response.status === 403) {
            if (pollInterval) {
              clearInterval(pollInterval);
              pollInterval = null;
            }
          }
          return;
        }
        
        const updatedRunData = await response.json();
        
        if (updatedRunData) {
          setRun((prevRun) => {
            // Check if anything actually changed by comparing updated_at
            if (prevRun.updated_at === updatedRunData.updated_at) {
              return prevRun; // No changes, don't update
            }
            
            // Stop polling if run is complete or failed
            if (updatedRunData.status === "complete" || updatedRunData.status === "failed") {
              if (pollInterval) {
                clearInterval(pollInterval);
                pollInterval = null;
              }
            }
            
            // Deep clone metadata to ensure React detects changes
            const newMetadata = updatedRunData.metadata 
              ? JSON.parse(JSON.stringify(updatedRunData.metadata))
              : {};
            
            return {
              ...prevRun,
              ...(updatedRunData as Run),
              metadata: newMetadata,
              // Preserve extra fields
              knowledge_base_name: prevRun.knowledge_base_name,
              workflow_name: prevRun.workflow_name,
              workflow_label: prevRun.workflow_label,
            };
          });
        }
      } catch (error) {
        // Silently handle errors - don't spam console
        // Only log if it's not a network error
        if (error instanceof TypeError && error.message.includes('fetch')) {
          // Network error, ignore
          return;
        }
      }
    };
    
    // Set up polling as fallback (every 1 second) - only for active runs
    // We'll check status in the fetch function and stop when complete
    pollInterval = setInterval(fetchRunUpdate, 1000);
    
    // Function to set up the subscription
    const setupSubscription = () => {
      if (isUnmounted) return;
      
      // Clean up existing channel if any
      if (channel) {
        try {
          channel.unsubscribe();
          supabase.removeChannel(channel);
        } catch (e) {
          // Ignore cleanup errors
        }
      }
      
      // Create new channel
      channel = supabase
        .channel(`run-${initialRun.id}`, {
          config: {
            broadcast: { self: true },
          },
        })
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "rag_runs",
            filter: `id=eq.${initialRun.id}`,
          },
          (payload) => {
            if (payload.eventType === "UPDATE" && payload.new) {
              // Update the run state with the new data, preserving extra fields
              const updatedRun = payload.new as Run;
              
              // Ensure metadata is properly handled - always create a new object reference
              setRun((prevRun) => {
                // Parse metadata if it's a string (shouldn't happen, but just in case)
                let parsedMetadata = updatedRun.metadata;
                if (typeof parsedMetadata === 'string') {
                  try {
                    parsedMetadata = JSON.parse(parsedMetadata);
                  } catch (e) {
                    console.error("[RunDetailClient] Failed to parse metadata:", e);
                    parsedMetadata = prevRun.metadata || {};
                  }
                }
                
                // Always create a deep copy of metadata to ensure React detects changes
                const newMetadata = parsedMetadata 
                  ? JSON.parse(JSON.stringify(parsedMetadata))  // Deep clone
                  : (prevRun.metadata ? JSON.parse(JSON.stringify(prevRun.metadata)) : {});
                
                const newRun = {
                  ...prevRun,
                  ...updatedRun,
                  metadata: newMetadata,  // Use the new metadata reference
                  // Preserve extra fields that aren't in the database
                  knowledge_base_name: prevRun.knowledge_base_name,
                  workflow_name: prevRun.workflow_name,
                  workflow_label: prevRun.workflow_label,
                };
                
                return newRun;
              });
            }
          }
        )
        .subscribe((status) => {
          if (status === "SUBSCRIBED") {
            console.log("[RunDetailClient] ✅ Subscription active");
          } else if (status === "CHANNEL_ERROR") {
            console.error("[RunDetailClient] ❌ Channel error - subscription failed, will retry...");
            // Reconnect after a delay
            if (!isUnmounted && channel) {
              reconnectTimeout = setTimeout(() => {
                if (!isUnmounted) {
                  setupSubscription();
                }
              }, 2000);
            }
          } else if (status === "TIMED_OUT") {
            console.error("[RunDetailClient] ❌ Subscription timed out, will retry...");
            // Reconnect after a delay
            if (!isUnmounted && channel) {
              reconnectTimeout = setTimeout(() => {
                if (!isUnmounted) {
                  setupSubscription();
                }
              }, 2000);
            }
          } else if (status === "CLOSED") {
            console.log("[RunDetailClient] ⚠️ Subscription closed");
          }
        });
    };
    
    // Initial subscription setup
    setupSubscription();

    // Cleanup subscription and polling on unmount
    return () => {
      isUnmounted = true;
      
      if (pollInterval) {
        clearInterval(pollInterval);
      }
      
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
      
      if (channel) {
        try {
          channel.unsubscribe();
          supabase.removeChannel(channel);
        } catch (e) {
          // Ignore cleanup errors
        }
      }
    };
  }, [initialRun.id]);

  // Update current time every second for live elapsed time
  useEffect(() => {
    if (run.status !== "complete" && run.status !== "failed") {
      const interval = setInterval(() => {
        setCurrentTime(new Date());
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [run.status]);

  // Extract metadata - React will re-render when run.metadata changes
  // The update handler ensures a new metadata object reference is created
  const metadata = run.metadata || {};
  const steps = Array.isArray(metadata.steps) ? [...metadata.steps] : []; // Create new array reference
  const completedSteps = Array.isArray(metadata.completed_steps_array) ? [...metadata.completed_steps_array] : []; // Create new array reference
  const currentStep = metadata.current_step || "queued";
  const totalSteps = metadata.total_steps || steps.length || 1;
  const completedStepsCount = metadata.completed_steps || completedSteps.length || 0;
  const startedAt = metadata.started_at || run.created_at;
  const completedAt = metadata.completed_at || (run.status === "complete" ? run.updated_at : null);
  const sourcesCount = metadata.sources_count;
  const documentsCreated = metadata.documents_created;

  // Calculate progress percentage
  // If all steps are done but status is not "complete", show 99% (final ingestion step)
  // Only show 100% when status = "complete"
  let progress = 0;
  if (run.status === "complete") {
    progress = 100;
  } else if (totalSteps > 0 && completedStepsCount >= totalSteps) {
    // All visible steps are done, but final ingestion is happening
    progress = 99;
  } else if (totalSteps > 0) {
    progress = Math.round((completedStepsCount / totalSteps) * 100);
  }

  // Calculate elapsed time
  const elapsedTime = formatDuration(startedAt, run.status === "complete" ? completedAt : null);

  // Estimate remaining time
  const estimatedRemaining = run.status === "complete"
    ? "Complete"
    : run.status === "failed"
    ? "—"
    : progress === 99
    ? "Almost Done"
    : estimateRemaining(elapsedTime, progress);

  // Get status message using workflow label
  const statusMessage = getStatusMessage(currentStep, run.workflow_label || null, metadata);

  // Use workflow label if available
  const runLabel = getRunLabel(run);

  // Get subject and geography from input
  const input = run.input || {};
  const researchParams = input.research_parameters || {};
  const aiConfig = input.ai_config || {};
  
  // Extract subject from research_parameters, with fallbacks
  const subject = researchParams.name 
    || input.niche_name 
    || input.subject 
    || run.workflow_label 
    || "Unknown";
  
  // Extract geography from research_parameters, with fallbacks
  const geography = researchParams.geography 
    || input.geo 
    || input.geography 
    || "Unknown";
  
  // Extract AI model for display
  const aiModel = aiConfig.model || null;

  // Action menu handlers
  const isComplete = run.status === "complete";
  const reportId = run.report_id;

  const handleDelete = async (deleteDocuments: boolean = false) => {
    if (isDeleting) return;

    setIsDeleting(true);
    try {
      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      const response = await fetch(`/api/intel/runs/${run.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({ deleteDocuments }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete run");
      }

      toast.success("Run deleted successfully");
      setShowDeleteDialog(false);
      router.push("/intel/research");
    } catch (error: any) {
      console.error("Error deleting run:", error);
      toast.error(error.message || "Failed to delete run");
    } finally {
      setIsDeleting(false);
    }
  };

  const actionMenuItems = [
    {
      label: "View Result",
      icon: <FontAwesomeIcon icon={faFileAlt} className="h-4 w-4" />,
      href: isComplete && reportId ? `/intel/research/${run.id}/result` : undefined,
      onClick: (e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (!isComplete || !reportId) {
          e?.preventDefault();
          toast.info("Result will be available after the run completes");
        }
      },
      disabled: !isComplete || !reportId,
    },
    ...(run.execution_url
      ? [
          {
            label: "View Execution",
            icon: <FontAwesomeIcon icon={faExternalLink} className="h-4 w-4" />,
            onClick: (e?: React.MouseEvent) => {
              e?.stopPropagation();
              window.open(run.execution_url!, "_blank");
            },
          },
        ]
      : []),
    { separator: true },
    {
      label: "Delete",
      icon: <FontAwesomeIcon icon={faTrash} className="h-4 w-4" />,
      onClick: (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setShowDeleteDialog(true);
      },
      destructive: true,
    },
  ];

  // Set page header with breadcrumbs and action menu
  useEffect(() => {
    setHeader({
      breadcrumbItems: [
        { href: "/intel/research", label: "Research" },
        { label: subject },
      ],
      actions: (
        <ActionMenu
          trigger={
            <button
              onClick={(e) => e.stopPropagation()}
              className="h-9 w-9 rounded-full hover:text-primary flex items-center justify-center shrink-0 cursor-pointer transition-all"
              aria-label="Actions"
            >
              <FontAwesomeIcon icon={faEllipsis} className="h-4 w-4" />
            </button>
          }
          items={actionMenuItems}
          align="end"
        />
      ),
    });
    return () => setHeader(null);
  }, [subject, run.status, run.report_id, run.execution_url, run.id, setHeader]);

  return (
    <div className="bg-background relative">
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            {/* Animated Icon */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${
                run.status === "failed"
                  ? "bg-red-600 dark:bg-red-500 text-background"
                  : "bg-primary text-primary-foreground"
              }`}
              style={{ 
                boxShadow: run.status === "failed"
                  ? "0 0 40px hsl(0 72% 51% / 0.6)"
                  : "0 0 40px hsl(var(--primary) / 0.4)",
              }}
            >
              <FontAwesomeIcon icon={faBrain} className="w-10 h-10" />
            </motion.div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-extrabold mb-3">
              {run.status === "failed" ? (
                <span className="text-red-600 dark:text-red-500">{runLabel}</span>
              ) : (
                <span
                  style={{
                    background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)))",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  {runLabel}
                </span>
              )}
            </h1>

            {/* Subject */}
            <div className="text-2xl font-semibold text-foreground mb-4">
              {subject}
            </div>

            {/* Geography Badge and AI Model */}
            <div className="flex flex-col items-center gap-3">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring" }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted border border-border"
              >
                <FontAwesomeIcon icon={faGlobe} className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">{geography}</span>
              </motion.div>
              
              {/* AI Model Badge */}
              {aiModel && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-xs text-muted-foreground/70"
                >
                  {aiModel}
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Progress Section */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center mb-12"
          >
            <CircularProgress percentage={progress} size={220} status={run.status} />

            {/* Time info */}
            <div className="flex items-center justify-center gap-8 mt-6">
              <div className="text-center min-w-[100px]">
                <div className="text-sm text-muted-foreground">Elapsed</div>
                <div className="text-lg font-bold text-foreground">
                  {elapsedTime}
                </div>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="text-center min-w-[100px]">
                <div className="text-sm text-muted-foreground">Remaining</div>
                <div className="text-lg font-bold text-foreground">
                  {estimatedRemaining}
                </div>
              </div>
            </div>

            {/* View Result Button - Only show when complete */}
            {run.status === "complete" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-10"
              >
                <button
                  onClick={() => router.push(`/intel/research/${run.id}/result`)}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors shadow-lg hover:shadow-xl"
                >
                  View Result
                  <FontAwesomeIcon icon={faArrowRight} className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </motion.div>

          {/* Timeline Section */}
          {steps.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-8"
            >

              <ProgressTimeline
                steps={steps}
                completedSteps={completedSteps}
                currentStep={currentStep}
                startedAt={startedAt}
                completedAt={completedAt}
                sourcesCount={sourcesCount}
                documentsCreated={documentsCreated}
              />
            </motion.div>
          )}
        </div>
      </main>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        entityName={runLabel}
        entityType="run"
        onConfirm={handleDelete}
        isDeleting={isDeleting}
        showDeleteDocumentsOption={true}
        deleteDocumentsLabel="Also delete associated documents"
        deleteDocumentsDefaultChecked={true}
      />
    </div>
  );
}





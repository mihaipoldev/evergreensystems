"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSpinner,
  faTimes,
  faFileText,
  faWandSparkles,
} from "@fortawesome/free-solid-svg-icons";
import { WorkflowSelectionCard } from "./WorkflowSelectionCard";
import { LockedInput } from "@/features/rag/shared/components";
import { cn } from "@/lib/utils";
import type { Workflow } from "../types";

/**
 * Convert array schema format to object format for form rendering.
 * New format: [{"name": "field1", "type": "text"}, {"name": "field2", "type": "textarea"}]
 * Object format: {"field1": "text", "field2": "textarea"}
 * Also handles backward compatibility with old object format.
 */
function arraySchemaToObject(schema: any): Record<string, string> {
  if (!schema) return {};
  
  // If it's already an object (old format), use it as-is
  if (typeof schema === 'object' && !Array.isArray(schema) && schema !== null) {
    return schema;
  }
  
  // If it's an array (new format), convert to object
  if (Array.isArray(schema)) {
    const obj: Record<string, string> = {};
    schema.forEach((field: any) => {
      if (field && typeof field === 'object' && 'name' in field && 'type' in field) {
        obj[field.name] = field.type;
      }
    });
    return obj;
  }
  
  return {};
}

interface GenerateNicheReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subjectType: string | null;
  researchSubjectId: string;
  researchSubjectName?: string;
  researchSubjectGeography?: string | null;
  researchSubjectDescription?: string | null;
  researchSubjectCategory?: string | null;
}

export function GenerateNicheReportModal({
  open,
  onOpenChange,
  subjectType,
  researchSubjectId,
  researchSubjectName,
  researchSubjectGeography,
  researchSubjectDescription,
  researchSubjectCategory,
}: GenerateNicheReportModalProps) {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [isExecuting, setIsExecuting] = useState(false);

  // Use research subject name from props, with state to handle updates
  const [subjectName, setSubjectName] = useState<string>(researchSubjectName || "");
  
  useEffect(() => {
    // Update subject name when prop changes
    if (researchSubjectName) {
      setSubjectName(researchSubjectName);
    } else if (open && researchSubjectId) {
      // Fetch the research subject name if not provided
      const fetchSubjectName = async () => {
        try {
          const supabase = createClient();
          const { data: sessionData } = await supabase.auth.getSession();
          const accessToken = sessionData?.session?.access_token;

          const response = await fetch(`/api/intel/research/${researchSubjectId}`, {
            headers: {
              ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
            },
          });

          if (response.ok) {
            const data = await response.json();
            if (data?.name) {
              setSubjectName(data.name);
            }
          }
        } catch (err) {
          console.error("Error fetching research subject name:", err);
        }
      };
      fetchSubjectName();
    }
  }, [open, researchSubjectId, researchSubjectName]);

  // Determine the subject type to use (default to 'niche' if null)
  const effectiveSubjectType = subjectType || 'niche';

  useEffect(() => {
    if (open) {
      fetchWorkflows();
      // Reset form when modal opens
      setFormValues({
        geo: researchSubjectGeography || "",
      });
      setSelectedWorkflow(null);
    } else {
      // Reset state when modal closes
      setWorkflows([]);
      setError(null);
      setSelectedWorkflow(null);
      setFormValues({});
    }
  }, [open, effectiveSubjectType, researchSubjectGeography]);

  // Reset form values when workflow changes
  useEffect(() => {
    if (selectedWorkflow) {
      const workflow = workflows.find((w) => w.id === selectedWorkflow);
      if (workflow?.input_schema) {
        const schemaObj = arraySchemaToObject(workflow.input_schema);
        const initialValues: Record<string, string> = {};
        Object.keys(schemaObj).forEach((key) => {
          // Pre-fill name/niche_name with research subject name
          if ((key === "name" || key === "niche_name") && subjectName) {
            initialValues[key] = subjectName;
          }
          // Pre-fill geo/geography with research subject geography
          else if ((key === "geo" || key === "geography") && researchSubjectGeography) {
            initialValues[key] = researchSubjectGeography;
          }
          // Pre-fill description with research subject description
          else if (key === "description") {
            initialValues[key] = researchSubjectDescription || "";
          }
          // Pre-fill category with research subject category
          else if (key === "category" && researchSubjectCategory) {
            initialValues[key] = researchSubjectCategory;
          }
          else {
            initialValues[key] = "";
          }
        });
        setFormValues(initialValues);
      }
    }
  }, [selectedWorkflow, workflows, researchSubjectGeography, researchSubjectDescription, researchSubjectCategory, subjectName]);

  const fetchWorkflows = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      // Use the new endpoint that filters workflows by subject type via junction table
      const response = await fetch(
        `/api/intel/subject-types/workflows?subject_type=${encodeURIComponent(effectiveSubjectType)}`,
        {
          headers: {
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to fetch workflows");
      }

      const data = await response.json();
      setWorkflows(data || []);
    } catch (err: any) {
      console.error("Error fetching workflows:", err);
      setError(err.message || "Failed to load workflows");
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteWorkflow = async () => {
    if (!selectedWorkflow) {
      return;
    }

    const workflow = workflows.find((w) => w.id === selectedWorkflow);
    if (!workflow?.input_schema) {
      return;
    }

    // Validate required fields (all fields in schema are required unless marked optional)
    const schemaObj = arraySchemaToObject(workflow.input_schema);
    const requiredFields = Object.keys(schemaObj);
    const missingFields = requiredFields.filter((key) => !formValues[key]?.trim());
    
    if (missingFields.length > 0) {
      toast.error(`Please fill in all required fields: ${missingFields.join(", ")}`);
      return;
    }

    setIsExecuting(true);

    try {
      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      const response = await fetch(`/api/intel/workflows/${selectedWorkflow}/execute`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({
          research_subject_id: researchSubjectId,
          input: formValues,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to execute workflow");
      }

      const workflow = workflows.find((w) => w.id === selectedWorkflow);
      toast.success(`Workflow "${workflow?.label || 'Unknown'}" executed successfully`);
      onOpenChange(false);
    } catch (err: any) {
      console.error("Error executing workflow:", err);
      const errorMessage = err.message || "Failed to execute workflow";
      toast.error(`Failed to execute workflow: ${errorMessage}`);
    } finally {
      setIsExecuting(false);
    }
  };

  // Get selected workflow and convert schema to object format for rendering
  const selectedWorkflowObj = workflows.find((w) => w.id === selectedWorkflow);
  const inputSchema = arraySchemaToObject(selectedWorkflowObj?.input_schema);

  // Helper to check if a field should be locked (pre-filled from research subject)
  const isFieldLocked = (fieldKey: string): boolean => {
    return (
      fieldKey === "name" ||
      fieldKey === "niche_name" ||
      fieldKey === "geo" ||
      fieldKey === "geography" ||
      fieldKey === "description" ||
      fieldKey === "category"
    );
  };

  // Helper to render form field based on schema
  const renderFormField = (fieldKey: string, fieldType: string) => {
    const value = formValues[fieldKey] || "";
    const label = fieldKey.charAt(0).toUpperCase() + fieldKey.slice(1).replace(/_/g, " ");
    const locked = isFieldLocked(fieldKey);
    
    // Normalize field type (handle "inputs" -> "input", etc.)
    const normalizedType = fieldType === "textarea" ? "textarea" : "input";

    if (normalizedType === "textarea") {
      return (
        <div key={fieldKey} className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">
            {label}
          </label>
          <textarea
            value={value}
            onChange={(e) => !locked && setFormValues((prev) => ({ ...prev, [fieldKey]: e.target.value }))}
            placeholder={`Enter ${label.toLowerCase()}...`}
            disabled={locked}
            className={cn(
              "flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none",
              locked
                ? "border-input bg-muted text-foreground cursor-not-allowed"
                : "border-input bg-input-background"
            )}
          />
        </div>
      );
    }

    // Default to input (for "input" type or any other type)
    return (
      <div key={fieldKey} className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">
          {label}
        </label>
        <input
          type="text"
          value={value}
          onChange={(e) => !locked && setFormValues((prev) => ({ ...prev, [fieldKey]: e.target.value }))}
          placeholder={`Enter ${label.toLowerCase()}...`}
          disabled={locked}
          className={cn(
            "w-full h-10 rounded-md border px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            locked
              ? "border-input bg-muted text-foreground cursor-not-allowed"
              : "border-input bg-input-background"
          )}
        />
      </div>
    );
  };

  if (!open) return null;

  return (
    <>
      {/* Header */}
      <div className="flex-shrink-0 p-4 md:p-6 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center"
            >
              <FontAwesomeIcon icon={faWandSparkles} className="w-6 h-6" />
            </motion.div>
            <div>
              <h1
                className="text-xl md:text-2xl font-bold"
                style={{
                  background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Generate Your Intelligence Report
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Select a workflow and configure your analysis
              </p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onOpenChange(false)}
            className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
          >
            <FontAwesomeIcon icon={faTimes} className="w-5 h-5" />
          </motion.button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        {loading && (
          <div className="text-center py-8 text-muted-foreground">
            <FontAwesomeIcon icon={faSpinner} className="w-6 h-6 animate-spin mx-auto mb-2" />
            <p>Loading workflows...</p>
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive mb-6">
            {error}
          </div>
        )}

        {!loading && !error && workflows.length === 0 && (
          <div className="rounded-xl border border-dashed border-border/60 bg-muted/30 p-8 text-center text-muted-foreground">
            No workflows available for subject type "{effectiveSubjectType}".
          </div>
        )}

        {!loading && !error && workflows.length > 0 && (
          <>
            {/* Workflow Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {workflows.map((workflow) => (
                <WorkflowSelectionCard
                  key={workflow.id}
                  workflow={workflow}
                  isSelected={selectedWorkflow === workflow.id}
                  onSelect={() => setSelectedWorkflow(workflow.id)}
                />
              ))}
            </div>

            {/* Expanded Form - Shows when workflow is selected */}
            <AnimatePresence>
              {selectedWorkflow && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="space-y-4"
                >
                  <div className="p-4 rounded-xl bg-card border border-border space-y-4">
                    <h2 className="text-base font-semibold flex items-center gap-2">
                      <FontAwesomeIcon icon={faFileText} className="w-4 h-4 text-primary" />
                      Report Configuration
                    </h2>

                    {/* Subject Selector - Locked to research subject */}
                    <LockedInput
                      label="Niche"
                      value={subjectName || "No subject selected"}
                    />

                    {/* Dynamic Form Fields */}
                    {Object.keys(inputSchema).length === 0 ? (
                      <div className="text-sm text-muted-foreground py-2">
                        No fields configured for this workflow.
                      </div>
                    ) : (
                      Object.entries(inputSchema).map(([fieldKey, fieldType]) => 
                        renderFormField(fieldKey, fieldType as string)
                      )
                    )}
                  </div>

                  {/* Generate Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleExecuteWorkflow}
                    disabled={!selectedWorkflow || isExecuting || Object.keys(inputSchema).some((key) => !formValues[key]?.trim())}
                    className={cn(
                      "w-full py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all",
                      "bg-primary text-primary-foreground",
                      "disabled:opacity-50 disabled:cursor-not-allowed",
                      "hover:bg-primary/90"
                    )}
                  >
                    {isExecuting ? (
                      <>
                        <FontAwesomeIcon icon={faSpinner} className="w-4 h-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faWandSparkles} className="w-4 h-4" />
                        Generate Report
                      </>
                    )}
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </>
  );
}


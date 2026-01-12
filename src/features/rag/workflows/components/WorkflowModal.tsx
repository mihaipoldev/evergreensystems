"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faKey, faChevronDown, faChevronUp, faCode } from "@fortawesome/free-solid-svg-icons";
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
import type { Workflow } from "../types";

// Lazy load lightweight code editor for JSON content (no SSR)
const CodeEditor = dynamic(() => import("@uiw/react-textarea-code-editor"), { ssr: false });

/**
 * Convert object schema format to array format for preserving order.
 * Old format: {"field1": "text", "field2": "textarea"}
 * New format: [{"name": "field1", "type": "text"}, {"name": "field2", "type": "textarea"}]
 */
function objectToArraySchema(obj: Record<string, any>): Array<{name: string, type: string}> {
  return Object.entries(obj).map(([name, type]) => ({
    name,
    type: typeof type === 'string' ? type : String(type)
  }));
}

/**
 * Convert schema to array format (handles both old object and new array formats).
 * This ensures we always work with array format which preserves order.
 */
function normalizeSchemaToArray(schema: any): Array<{name: string, type: string}> | null {
  if (!schema) return null;
  
  if (Array.isArray(schema)) {
    // Already in array format, validate structure
    return schema.every(field => field && typeof field === 'object' && 'name' in field && 'type' in field)
      ? schema
      : null;
  }
  
  if (typeof schema === 'object' && schema !== null) {
    // Old object format, convert to array
    return objectToArraySchema(schema);
  }
  
  return null;
}

/**
 * Stringify schema as array format to preserve order.
 */
function stringifySchema(schema: any): string {
  const arraySchema = normalizeSchemaToArray(schema);
  if (!arraySchema || arraySchema.length === 0) {
    return "";
  }
  return JSON.stringify(arraySchema, null, 2);
}

interface WorkflowModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Workflow | null;
  onSuccess?: (updatedData: Workflow) => void;
}

export function WorkflowModal({
  open,
  onOpenChange,
  initialData,
  onSuccess,
}: WorkflowModalProps) {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const isEdit = !!initialData;
  const [name, setName] = useState("");
  const [label, setLabel] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("");
  const [estimatedCost, setEstimatedCost] = useState("");
  const [estimatedTimeMinutes, setEstimatedTimeMinutes] = useState("");
  const [defaultAiModel, setDefaultAiModel] = useState<string>("anthropic/claude-haiku-4.5");
  const [inputSchema, setInputSchema] = useState("");
  const [enabled, setEnabled] = useState(true);
  const [knowledgeBaseTarget, setKnowledgeBaseTarget] = useState<string>("knowledgebase");
  const [targetKnowledgeBaseId, setTargetKnowledgeBaseId] = useState<string>("");
  const [knowledgeBases, setKnowledgeBases] = useState<Array<{ id: string; name: string }>>([]);
  const [errors, setErrors] = useState<{ name?: string; label?: string; inputSchema?: string; webhookUrl?: string; config?: string; knowledgeBaseTarget?: string; targetKnowledgeBaseId?: string; defaultAiModel?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Secrets state
  const [webhookUrl, setWebhookUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [config, setConfig] = useState("");
  const [secretsExpanded, setSecretsExpanded] = useState(false);
  const [hasSecrets, setHasSecrets] = useState(false);
  
  // Store the original JSON string to preserve key order
  const originalInputSchemaRef = useRef<string>("");

  // Handle theme mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch knowledge bases on mount (excluding those with kb_type 'project')
  useEffect(() => {
    const fetchKnowledgeBases = async () => {
      try {
        const supabase = createClient();
        const { data: sessionData } = await supabase.auth.getSession();
        const accessToken = sessionData?.session?.access_token;

        // Fetch knowledge bases
        const kbResponse = await fetch("/api/intel/knowledge-base", {
          headers: {
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          },
        });

        if (kbResponse.ok) {
          const knowledgeBasesData = await kbResponse.json();
          
          // Filter out knowledge bases that have kb_type = 'project'
          const filteredKbs = (knowledgeBasesData || []).filter(
            (kb: { id: string; kb_type?: string }) => kb.kb_type !== 'project'
          );
          
          setKnowledgeBases(filteredKbs);
        }
      } catch (error) {
        console.error("Error fetching knowledge bases:", error);
      }
    };

    if (open) {
      fetchKnowledgeBases();
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

            const response = await fetch(`/api/intel/workflows/${initialData.id}`, {
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
              setEstimatedCost(latestData.estimated_cost !== null ? latestData.estimated_cost.toString() : "");
              setEstimatedTimeMinutes(latestData.estimated_time_minutes !== null ? latestData.estimated_time_minutes.toString() : "");
              setDefaultAiModel(latestData.default_ai_model || "anthropic/claude-haiku-4.5");
              // Convert to array format to preserve order
              const schemaString = stringifySchema(latestData.input_schema);
              setInputSchema(schemaString);
              originalInputSchemaRef.current = schemaString;
              setEnabled(latestData.enabled !== undefined ? latestData.enabled : true);
              setKnowledgeBaseTarget(latestData.knowledge_base_target || "knowledgebase");
              setTargetKnowledgeBaseId(latestData.target_knowledge_base_id || "");
              
              // Fetch secrets for editing
              const secretsResponse = await fetch(`/api/intel/workflows/${initialData.id}/secrets`, {
                headers: {
                  ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
                },
              });
              
              if (secretsResponse.ok) {
                const secretsData = await secretsResponse.json();
                console.log("Secrets data received:", secretsData);
                // Check if secrets exist - either by exists flag or by presence of webhook_url
                const hasSecretsValue = secretsData.exists === true || (secretsData.webhook_url && secretsData.webhook_url.trim() !== "");
                setHasSecrets(hasSecretsValue);
                // Populate secret values if they exist
                if (hasSecretsValue && secretsData.webhook_url) {
                  setWebhookUrl(secretsData.webhook_url);
                  setApiKey(secretsData.api_key || "");
                  setConfig(secretsData.config ? JSON.stringify(secretsData.config, null, 2) : "");
                  // Auto-expand secrets section when secrets exist
                  setSecretsExpanded(true);
                  console.log("Secrets populated - webhookUrl:", secretsData.webhook_url, "apiKey:", secretsData.api_key ? "***" : "");
                } else {
                  console.log("No secrets found or webhook_url is empty");
                }
              } else {
                console.error("Secrets response not OK:", secretsResponse.status, await secretsResponse.text());
              }
            } else {
              // Fallback to initialData if fetch fails
              setName(initialData.name || "");
              setLabel(initialData.label || "");
              setDescription(initialData.description || "");
              setIcon(initialData.icon || "");
              setEstimatedCost(initialData.estimated_cost !== null ? initialData.estimated_cost.toString() : "");
              setEstimatedTimeMinutes(initialData.estimated_time_minutes !== null ? initialData.estimated_time_minutes.toString() : "");
              setDefaultAiModel(initialData.default_ai_model || "anthropic/claude-haiku-4.5");
              // Convert to array format to preserve order
              const schemaString = stringifySchema(initialData.input_schema);
              setInputSchema(schemaString);
              originalInputSchemaRef.current = schemaString;
              setEnabled(initialData.enabled !== undefined ? initialData.enabled : true);
              setKnowledgeBaseTarget(initialData.knowledge_base_target || "knowledgebase");
              setTargetKnowledgeBaseId(initialData.target_knowledge_base_id || "");
              
              // Try to fetch secrets even if workflow fetch failed
              try {
                const supabase = createClient();
                const { data: sessionData } = await supabase.auth.getSession();
                const accessToken = sessionData?.session?.access_token;
                
                const secretsResponse = await fetch(`/api/intel/workflows/${initialData.id}/secrets`, {
                  headers: {
                    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
                  },
                });
                
                if (secretsResponse.ok) {
                  const secretsData = await secretsResponse.json();
                  console.log("Secrets data received (fallback):", secretsData);
                  const hasSecretsValue = secretsData.exists === true || (secretsData.webhook_url && secretsData.webhook_url.trim() !== "");
                  setHasSecrets(hasSecretsValue);
                  if (hasSecretsValue && secretsData.webhook_url) {
                    setWebhookUrl(secretsData.webhook_url);
                    setApiKey(secretsData.api_key || "");
                    setConfig(secretsData.config ? JSON.stringify(secretsData.config, null, 2) : "");
                    // Auto-expand secrets section when secrets exist
                    setSecretsExpanded(true);
                    console.log("Secrets populated (fallback) - webhookUrl:", secretsData.webhook_url);
                  }
                } else {
                  console.error("Secrets response not OK (fallback):", secretsResponse.status);
                }
              } catch (secretsError) {
                console.error("Error fetching secrets:", secretsError);
              }
            }
          } catch (error) {
            console.error("Error fetching latest workflow data:", error);
            // Fallback to initialData if fetch fails
            setName(initialData.name || "");
            setLabel(initialData.label || "");
            setDescription(initialData.description || "");
            setIcon(initialData.icon || "");
            setEstimatedCost(initialData.estimated_cost !== null ? initialData.estimated_cost.toString() : "");
            setEstimatedTimeMinutes(initialData.estimated_time_minutes !== null ? initialData.estimated_time_minutes.toString() : "");
            setDefaultAiModel(initialData.default_ai_model || "anthropic/claude-haiku-4.5");
            // Convert to array format to preserve order
            const schemaString = stringifySchema(initialData.input_schema);
            setInputSchema(schemaString);
            originalInputSchemaRef.current = schemaString;
            setEnabled(initialData.enabled !== undefined ? initialData.enabled : true);
            setKnowledgeBaseTarget(initialData.knowledge_base_target || "knowledgebase");
            setTargetKnowledgeBaseId(initialData.target_knowledge_base_id || "");
            
            // Try to fetch secrets even if workflow fetch failed
            try {
              const supabase = createClient();
              const { data: sessionData } = await supabase.auth.getSession();
              const accessToken = sessionData?.session?.access_token;
              
              const secretsResponse = await fetch(`/api/intel/workflows/${initialData.id}/secrets`, {
                headers: {
                  ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
                },
              });
              
              if (secretsResponse.ok) {
                const secretsData = await secretsResponse.json();
                console.log("Secrets data received (error fallback):", secretsData);
                const hasSecretsValue = secretsData.exists === true || (secretsData.webhook_url && secretsData.webhook_url.trim() !== "");
                setHasSecrets(hasSecretsValue);
                if (hasSecretsValue && secretsData.webhook_url) {
                  setWebhookUrl(secretsData.webhook_url);
                  setApiKey(secretsData.api_key || "");
                  setConfig(secretsData.config ? JSON.stringify(secretsData.config, null, 2) : "");
                  // Auto-expand secrets section when secrets exist
                  setSecretsExpanded(true);
                  console.log("Secrets populated (error fallback) - webhookUrl:", secretsData.webhook_url);
                }
              } else {
                console.error("Secrets response not OK (error fallback):", secretsResponse.status);
              }
            } catch (secretsError) {
              console.error("Error fetching secrets:", secretsError);
            }
          }
        };

        fetchLatestData();
      } else {
        // Reset to defaults for create mode
        setName("");
        setLabel("");
        setDescription("");
        setIcon("");
        setEstimatedCost("");
        setEstimatedTimeMinutes("");
        setDefaultAiModel("anthropic/claude-haiku-4.5");
        setInputSchema("");
        originalInputSchemaRef.current = "";
        setEnabled(true);
        setKnowledgeBaseTarget("knowledgebase");
        setTargetKnowledgeBaseId("");
        setWebhookUrl("");
        setApiKey("");
        setConfig("");
        setHasSecrets(false);
        setSecretsExpanded(false);
      }
      setErrors({});
    }
  }, [initialData?.id, open]);

  const handleSubmit = async () => {
    const newErrors: { name?: string; label?: string; inputSchema?: string; webhookUrl?: string; config?: string; knowledgeBaseTarget?: string; targetKnowledgeBaseId?: string; defaultAiModel?: string } = {};

    if (!name.trim()) {
      newErrors.name = "Name is required";
    }
    if (!label.trim()) {
      newErrors.label = "Label is required";
    }
    if (!defaultAiModel || !defaultAiModel.trim()) {
      newErrors.defaultAiModel = "Default AI model is required";
    } else {
      const validModels = [
        'anthropic/claude-sonnet-4.5',
        'anthropic/claude-haiku-4.5',
        'google/gemini-3-flash-preview',
        'google/gemini-3-pro-preview',
        'openai/gpt-4o-mini',
        'openai/gpt-4o',
        'openai/gpt-5-mini',
        'openai/gpt-5.2'
      ];
      if (!validModels.includes(defaultAiModel)) {
        newErrors.defaultAiModel = "Invalid AI model selected";
      }
    }
    if (!knowledgeBaseTarget || !['knowledgebase', 'client', 'project'].includes(knowledgeBaseTarget)) {
      newErrors.knowledgeBaseTarget = "Knowledge base target is required and must be one of: knowledgebase, client, project";
    }
    // Validate target_knowledge_base_id when knowledge_base_target is 'knowledgebase'
    if (knowledgeBaseTarget === 'knowledgebase' && !targetKnowledgeBaseId.trim()) {
      newErrors.targetKnowledgeBaseId = "Knowledge base is required when target is 'knowledgebase'";
    }

    // Validate input_schema JSON if provided
    let parsedInputSchema = null;
    if (inputSchema.trim()) {
      try {
        const parsed = JSON.parse(inputSchema);
        // Normalize to array format (convert object if needed for backward compatibility)
        parsedInputSchema = normalizeSchemaToArray(parsed);
        if (parsedInputSchema === null && parsed !== null) {
          newErrors.inputSchema = "Schema must be an array of field objects or an object with field definitions";
        }
      } catch (e) {
        newErrors.inputSchema = "Invalid JSON format";
      }
    }

    // Validate secrets if secrets section is expanded and has values
    if (secretsExpanded && webhookUrl.trim()) {
      try {
        new URL(webhookUrl.trim());
      } catch {
        newErrors.webhookUrl = "Must be a valid URL";
      }
    }

    // Validate config JSON if provided
    let parsedConfig = null;
    if (config.trim()) {
      try {
        parsedConfig = JSON.parse(config);
      } catch (e) {
        newErrors.config = "Invalid JSON format";
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
        ? `/api/intel/workflows/${initialData!.id}`
        : "/api/intel/workflows";
      const method = isEdit ? "PUT" : "POST";

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
          estimated_cost: estimatedCost.trim() ? parseFloat(estimatedCost) : null,
          estimated_time_minutes: estimatedTimeMinutes.trim() ? parseInt(estimatedTimeMinutes, 10) : null,
          default_ai_model: defaultAiModel.trim(),
          input_schema: parsedInputSchema,
          enabled,
          knowledge_base_target: knowledgeBaseTarget,
          target_knowledge_base_id: targetKnowledgeBaseId.trim() || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Failed to ${isEdit ? "update" : "create"} workflow`);
      }

      const result = await response.json();
      
      // Save secrets if provided (only if secrets section was expanded and has webhook URL)
      if (secretsExpanded && webhookUrl.trim()) {
        try {
          const secretsResponse = await fetch(`/api/intel/workflows/${result.id}/secrets`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
            },
            body: JSON.stringify({
              webhook_url: webhookUrl.trim(),
              api_key: apiKey.trim() || null,
              config: parsedConfig,
            }),
          });

          if (!secretsResponse.ok) {
            const secretsError = await secretsResponse.json();
            throw new Error(secretsError.error || "Failed to save secrets");
          }
        } catch (secretsError: any) {
          console.error("Error saving secrets:", secretsError);
          toast.error(secretsError.message || "Workflow saved but failed to save secrets");
          // Still continue with success flow since workflow was saved
        }
      }
      
      toast.success(`Workflow ${isEdit ? "updated" : "created"} successfully`);
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      handleClose();
      
      if (isEdit) {
        router.refresh();
      } else {
        if (!onSuccess) {
          router.push(`/intel/workflows/${result.id}`);
        }
        router.refresh();
      }
    } catch (error: any) {
      console.error(`Error ${isEdit ? "updating" : "creating"} workflow:`, error);
      toast.error(error.message || `Failed to ${isEdit ? "update" : "create"} workflow`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format JSON function
  const formatJSON = (jsonString: string, isConfig = false): string => {
    if (!jsonString.trim()) return "";
    
    try {
      const parsed = JSON.parse(jsonString);
      const formatted = JSON.stringify(parsed, null, 2);
      
      // For input schema, normalize to array format if needed
      if (!isConfig) {
        const arraySchema = normalizeSchemaToArray(parsed);
        if (arraySchema !== null) {
          return JSON.stringify(arraySchema, null, 2);
        }
      }
      
      return formatted;
    } catch (error) {
      toast.error("Invalid JSON format. Please check your JSON syntax.");
      return jsonString;
    }
  };

  const handleFormatInputSchema = () => {
    const formatted = formatJSON(inputSchema, false);
    if (formatted !== inputSchema) {
      setInputSchema(formatted);
      originalInputSchemaRef.current = formatted;
      if (errors.inputSchema) {
        setErrors({ ...errors, inputSchema: undefined });
      }
    }
  };

  const handleFormatConfig = () => {
    const formatted = formatJSON(config, true);
    if (formatted !== config) {
      setConfig(formatted);
      if (errors.config) {
        setErrors({ ...errors, config: undefined });
      }
    }
  };

  const handleClose = () => {
    setName("");
    setLabel("");
    setDescription("");
    setIcon("");
    setEstimatedCost("");
    setEstimatedTimeMinutes("");
    setDefaultAiModel("anthropic/claude-haiku-4.5");
    setInputSchema("");
    originalInputSchemaRef.current = "";
    setEnabled(true);
    setKnowledgeBaseTarget("knowledgebase");
    setTargetKnowledgeBaseId("");
    setWebhookUrl("");
    setApiKey("");
    setConfig("");
    setSecretsExpanded(false);
    setHasSecrets(false);
    setErrors({});
    onOpenChange(false);
  };

  return (
    <RAGModal
      open={open}
      onOpenChange={handleClose}
      title={isEdit ? "Edit Workflow" : "Create Workflow"}
      footer={
        <>
          <Button
            className="shadow-buttons border-none bg-muted/20 hover:text-foreground hover:bg-muted/30 py-3 md:py-2"
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            className="shadow-buttons border-none py-6 md:py-2"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting
              ? isEdit
                ? "Updating..."
                : "Creating..."
              : isEdit
                ? "Update Workflow"
                : "Create Workflow"}
          </Button>
        </>
      }
    >
      <div className="space-y-4 md:space-y-5">
        {/* Name */}
        <div className="space-y-1.5 md:space-y-2">
          <Label htmlFor="workflow-name" className="text-sm md:text-base">
            Name <span className="text-destructive">*</span>
          </Label>
          <RAGInput
            id="workflow-name"
            placeholder="e.g., niche_intelligence"
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
        <div className="space-y-1.5 md:space-y-2">
          <Label htmlFor="workflow-label" className="text-sm md:text-base">
            Label <span className="text-destructive">*</span>
          </Label>
          <RAGInput
            id="workflow-label"
            placeholder="e.g., Niche Intelligence"
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
        <div className="space-y-1.5 md:space-y-2 pt-2 md:pt-0 border-t border-border/50 md:border-t-0">
          <Label htmlFor="workflow-description" className="text-sm md:text-base">Description</Label>
          <RAGTextarea
            id="workflow-description"
            placeholder="Describe what this workflow does..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="min-h-[80px] md:min-h-[120px]"
          />
        </div>

        {/* Knowledge Base Target */}
        <div className="space-y-1.5 md:space-y-2">
          <Label htmlFor="workflow-knowledge-base-target" className="text-sm md:text-base">
            Knowledge Base Target <span className="text-destructive">*</span>
          </Label>
          <RAGSelect
            value={knowledgeBaseTarget}
            onValueChange={(value) => {
              setKnowledgeBaseTarget(value);
              // Clear target_knowledge_base_id if not 'knowledgebase'
              if (value !== 'knowledgebase') {
                setTargetKnowledgeBaseId("");
              }
              if (errors.knowledgeBaseTarget) setErrors({ ...errors, knowledgeBaseTarget: undefined });
            }}
          >
            <RAGSelectTrigger id="workflow-knowledge-base-target" error={!!errors.knowledgeBaseTarget}>
              <RAGSelectValue placeholder="Select target type" />
            </RAGSelectTrigger>
            <RAGSelectContent>
              <RAGSelectItem value="knowledgebase">Knowledge Base</RAGSelectItem>
              <RAGSelectItem value="client">Client</RAGSelectItem>
              <RAGSelectItem value="project">Project</RAGSelectItem>
            </RAGSelectContent>
          </RAGSelect>
          {errors.knowledgeBaseTarget && (
            <p className="text-xs text-destructive">{errors.knowledgeBaseTarget}</p>
          )}
        </div>

        {/* Target Knowledge Base ID - Only show when target is 'knowledgebase' */}
        {knowledgeBaseTarget === 'knowledgebase' && (
          <div className="space-y-1.5 md:space-y-2">
            <Label htmlFor="workflow-target-knowledge-base-id" className="text-sm md:text-base">
              Target Knowledge Base {knowledgeBaseTarget === 'knowledgebase' && <span className="text-destructive">*</span>}
            </Label>
            <RAGSelect
              value={targetKnowledgeBaseId}
              onValueChange={(value) => {
                setTargetKnowledgeBaseId(value);
                if (errors.targetKnowledgeBaseId) setErrors({ ...errors, targetKnowledgeBaseId: undefined });
              }}
            >
              <RAGSelectTrigger id="workflow-target-knowledge-base-id" error={!!errors.targetKnowledgeBaseId}>
                <RAGSelectValue placeholder="Select knowledge base" />
              </RAGSelectTrigger>
              <RAGSelectContent>
                {knowledgeBases.length === 0 ? (
                  <div className="py-2 px-3 text-sm text-muted-foreground">
                    No knowledge bases available
                  </div>
                ) : (
                  knowledgeBases.map((kb) => (
                    <RAGSelectItem key={kb.id} value={kb.id}>
                      {kb.name}
                    </RAGSelectItem>
                  ))
                )}
              </RAGSelectContent>
            </RAGSelect>
            {errors.targetKnowledgeBaseId && (
              <p className="text-xs text-destructive">{errors.targetKnowledgeBaseId}</p>
            )}
          </div>
        )}

        {/* Icon */}
        <div className="space-y-1.5 md:space-y-2">
          <Label htmlFor="workflow-icon" className="text-sm md:text-base">Icon</Label>
          <RAGInput
            id="workflow-icon"
            placeholder="e.g., 📊, 👥"
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
          />
        </div>

        {/* Estimated Cost */}
        <div className="space-y-1.5 md:space-y-2">
          <Label htmlFor="workflow-cost" className="text-sm md:text-base">Estimated Cost</Label>
          <RAGInput
            id="workflow-cost"
            type="number"
            step="0.01"
            placeholder="e.g., 10.50"
            value={estimatedCost}
            onChange={(e) => setEstimatedCost(e.target.value)}
          />
        </div>

        {/* Estimated Time Minutes */}
        <div className="space-y-1.5 md:space-y-2">
          <Label htmlFor="workflow-time" className="text-sm md:text-base">Estimated Time (minutes)</Label>
          <RAGInput
            id="workflow-time"
            type="number"
            placeholder="e.g., 30"
            value={estimatedTimeMinutes}
            onChange={(e) => setEstimatedTimeMinutes(e.target.value)}
          />
        </div>

        {/* Default AI Model */}
        <div className="space-y-1.5 md:space-y-2">
          <Label htmlFor="workflow-default-ai-model" className="text-sm md:text-base">
            Default AI Model <span className="text-destructive">*</span>
          </Label>
          <RAGSelect
            value={defaultAiModel}
            onValueChange={(value) => {
              setDefaultAiModel(value);
              if (errors.defaultAiModel) setErrors({ ...errors, defaultAiModel: undefined });
            }}
          >
            <RAGSelectTrigger id="workflow-default-ai-model" error={!!errors.defaultAiModel}>
              <RAGSelectValue placeholder="Select AI model" />
            </RAGSelectTrigger>
            <RAGSelectContent>
              <RAGSelectItem value="anthropic/claude-sonnet-4.5">anthropic/claude-sonnet-4.5</RAGSelectItem>
              <RAGSelectItem value="anthropic/claude-haiku-4.5">anthropic/claude-haiku-4.5</RAGSelectItem>
              <RAGSelectItem value="google/gemini-3-flash-preview">google/gemini-3-flash-preview</RAGSelectItem>
              <RAGSelectItem value="google/gemini-3-pro-preview">google/gemini-3-pro-preview</RAGSelectItem>
              <RAGSelectItem value="openai/gpt-4o-mini">openai/gpt-4o-mini</RAGSelectItem>
              <RAGSelectItem value="openai/gpt-4o">openai/gpt-4o</RAGSelectItem>
              <RAGSelectItem value="openai/gpt-5-mini">openai/gpt-5-mini</RAGSelectItem>
              <RAGSelectItem value="openai/gpt-5.2">openai/gpt-5.2</RAGSelectItem>
            </RAGSelectContent>
          </RAGSelect>
          {errors.defaultAiModel && (
            <p className="text-xs text-destructive">{errors.defaultAiModel}</p>
          )}
        </div>

        {/* Input Schema */}
        <div className="space-y-1.5 md:space-y-2 pt-2 md:pt-0 border-t border-border/50 md:border-t-0">
          <div className="flex items-center justify-between">
            <Label htmlFor="workflow-schema" className="text-sm md:text-base">Input Schema (JSON)</Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleFormatInputSchema}
              className="h-7 text-xs"
            >
              <FontAwesomeIcon icon={faCode} className="h-3 w-3 mr-1.5" />
              Format JSON
            </Button>
          </div>
          <div className={`border rounded-lg bg-background overflow-hidden ${errors.inputSchema ? "border-destructive" : "border-input"}`}>
            {mounted && (
              <CodeEditor
                value={inputSchema}
                language="json"
                placeholder='[{"name": "field1", "type": "text"}, {"name": "field2", "type": "textarea"}]'
                onChange={(evn) => {
                  const newValue = evn.target.value;
                  setInputSchema(newValue);
                  // Update the ref to preserve the user's typed order
                  originalInputSchemaRef.current = newValue;
                  if (errors.inputSchema) setErrors({ ...errors, inputSchema: undefined });
                }}
                padding={12}
                style={{
                  minHeight: "160px",
                  fontSize: "13px",
                  fontFamily: "ui-monospace, SFMono-Regular, 'SF Mono', 'Courier New', Courier, 'Liberation Mono', Menlo, Consolas, 'DejaVu Sans Mono', monospace",
                  lineHeight: "1.5",
                  letterSpacing: "0",
                  backgroundColor: "transparent",
                }}
                data-color-mode={mounted && resolvedTheme === "dark" ? "dark" : "light"}
              />
            )}
          </div>
          {errors.inputSchema && (
            <p className="text-xs text-destructive">{errors.inputSchema}</p>
          )}
        </div>

        {/* Enabled */}
        <div className="space-y-1.5 md:space-y-2">
          <Label htmlFor="workflow-enabled" className="text-sm md:text-base">Status</Label>
          <RAGSelect
            value={enabled ? "enabled" : "disabled"}
            onValueChange={(value) => {
              setEnabled(value === "enabled");
            }}
          >
            <RAGSelectTrigger id="workflow-enabled">
              <RAGSelectValue placeholder="Select status" />
            </RAGSelectTrigger>
            <RAGSelectContent>
              <RAGSelectItem value="enabled">Enabled</RAGSelectItem>
              <RAGSelectItem value="disabled">Disabled</RAGSelectItem>
            </RAGSelectContent>
          </RAGSelect>
        </div>

        {/* Secrets Section - Collapsible */}
        <div className="border-t border-border/50 pt-3 md:pt-5">
          <Collapsible open={secretsExpanded} onOpenChange={setSecretsExpanded}>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-2.5 md:p-3 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faKey} className="h-3.5 w-3.5 md:h-4 md:w-4 text-muted-foreground" />
                <span className="font-medium text-xs md:text-sm">Secrets Configuration</span>
                {hasSecrets && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-green-600/10 text-green-600 dark:text-green-400">
                    Configured
                  </span>
                )}
              </div>
              <FontAwesomeIcon 
                icon={secretsExpanded ? faChevronUp : faChevronDown} 
                className="h-4 w-4 text-muted-foreground" 
              />
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3 md:space-y-4 pt-3 md:pt-4">
              <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-2.5 md:p-3 text-xs md:text-sm text-yellow-700 dark:text-yellow-400">
                <strong>Security Notice:</strong> These secrets are stored securely and never exposed. 
                Enter new values to update them.
              </div>
              
              <div className="space-y-1.5 md:space-y-2">
                <Label htmlFor="workflow-webhook-endpoint" className="text-sm md:text-base">
                  Webhook URL <span className="text-destructive">*</span>
                </Label>
                <RAGInput
                  id="workflow-webhook-endpoint"
                  name="workflow-webhook-endpoint"
                  type="text"
                  autoComplete="one-time-code"
                  data-lpignore="true"
                  data-form-type="other"
                  placeholder="https://your-n8n-instance.com/webhook/..."
                  value={webhookUrl}
                  onChange={(e) => {
                    setWebhookUrl(e.target.value);
                    if (errors.webhookUrl) setErrors({ ...errors, webhookUrl: undefined });
                  }}
                  error={!!errors.webhookUrl}
                />
                {errors.webhookUrl && (
                  <p className="text-xs text-destructive">{errors.webhookUrl}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  The n8n webhook endpoint URL for this workflow
                </p>
              </div>

              <div className="space-y-1.5 md:space-y-2">
                <Label htmlFor="workflow-api-key" className="text-sm md:text-base">API Key (optional)</Label>
                <RAGInput
                  id="workflow-api-key"
                  name="workflow-api-key"
                  type="password"
                  autoComplete="new-password"
                  data-lpignore="true"
                  data-form-type="other"
                  placeholder="Enter API key if needed"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Optional API key for authentication
                </p>
              </div>

              <div className="space-y-1.5 md:space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="secrets-config" className="text-sm md:text-base">Config (JSON, optional)</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleFormatConfig}
                    className="h-7 text-xs"
                  >
                    <FontAwesomeIcon icon={faCode} className="h-3 w-3 mr-1.5" />
                    Format JSON
                  </Button>
                </div>
                <div className={`border rounded-lg bg-background overflow-hidden ${errors.config ? "border-destructive" : "border-input"}`}>
                  {mounted && (
                    <CodeEditor
                      value={config}
                      language="json"
                      placeholder='{"key": "value"}'
                      onChange={(evn) => {
                        const newValue = evn.target.value;
                        setConfig(newValue);
                        if (errors.config) setErrors({ ...errors, config: undefined });
                      }}
                      padding={12}
                      style={{
                        minHeight: "100px",
                        fontSize: "13px",
                        fontFamily: "ui-monospace, SFMono-Regular, 'SF Mono', 'Courier New', Courier, 'Liberation Mono', Menlo, Consolas, 'DejaVu Sans Mono', monospace",
                        lineHeight: "1.5",
                        letterSpacing: "0",
                        backgroundColor: "transparent",
                      }}
                      data-color-mode={mounted && resolvedTheme === "dark" ? "dark" : "light"}
                    />
                  )}
                </div>
                {errors.config && (
                  <p className="text-xs text-destructive">{errors.config}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Additional configuration as JSON object
                </p>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>
    </RAGModal>
  );
}


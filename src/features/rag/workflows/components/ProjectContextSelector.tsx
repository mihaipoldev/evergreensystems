"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export type ProjectContextDocument = {
  id: string;
  title: string;
  created_at: string;
  run_id: string;
  document_ids: string[];
};

export type ProjectContextField = {
  name?: string;
  type: string;
  workflow_type?: string;
  display_name?: string;
  placeholder?: string;
  description?: string;
  required?: boolean;
  locked?: boolean;
};

type ProjectContextSelectorProps = {
  field: ProjectContextField;
  projectId: string;
  value: string[]; // document_ids
  onChange: (documentIds: string[]) => void;
  disabled?: boolean;
};

function formatDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return isoString;
  }
}

export function ProjectContextSelector({
  field,
  projectId,
  value,
  onChange,
  disabled = false,
}: ProjectContextSelectorProps) {
  const [documents, setDocuments] = useState<ProjectContextDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const workflowType = field.workflow_type || "";
  const displayName = field.display_name || (field.name ?? "").replace(/_/g, " ");
  const placeholder = field.placeholder || "Latest";

  useEffect(() => {
    if (!projectId || !workflowType) {
      setLoading(false);
      setDocuments([]);
      return;
    }

    const fetchDocuments = async () => {
      setLoading(true);
      setError(null);
      try {
        const supabase = createClient();
        const { data: sessionData } = await supabase.auth.getSession();
        const accessToken = sessionData?.session?.access_token;

        const response = await fetch(
          `/api/intel/projects/${projectId}/documents-by-workflow?workflow_type=${encodeURIComponent(workflowType)}`,
          {
            headers: {
              ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
            },
          }
        );

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || "Failed to fetch documents");
        }

        const data = await response.json();
        const rawDocs = (data.documents || []) as ProjectContextDocument[];
        setDocuments(rawDocs);

        // Auto-select latest (first) document when value is empty
        if ((!value || value.length === 0) && rawDocs.length > 0) {
          onChange(rawDocs[0].document_ids);
        }
      } catch (err) {
        console.error("Error fetching project context documents:", err);
        setError(err instanceof Error ? err.message : "Failed to load documents");
        setDocuments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [projectId, workflowType]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <FontAwesomeIcon icon={faSpinner} className="w-4 h-4 animate-spin" />
        <span>Loading {displayName}...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-destructive">
        {error}
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        No {displayName} documents available
      </div>
    );
  }

  // Derive selected document id from document_ids (for Select display)
  const selectedDocId =
    Array.isArray(value) && value.length > 0
      ? documents.find((d) => d.document_ids[0] === value[0])?.id
      : undefined;

  return (
    <Select
      value={selectedDocId || undefined}
      onValueChange={(docId) => {
        const doc = documents.find((d) => d.id === docId);
        if (doc) onChange(doc.document_ids);
      }}
      disabled={disabled}
    >
      <SelectTrigger
        className={cn(
          "w-full",
          disabled && "cursor-not-allowed opacity-70"
        )}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="z-[200]" position="popper">
        {documents.map((doc) => (
          <SelectItem key={doc.id} value={doc.id}>
            {doc.title} - {formatDate(doc.created_at)} (run: {doc.run_id.slice(0, 8)}...)
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

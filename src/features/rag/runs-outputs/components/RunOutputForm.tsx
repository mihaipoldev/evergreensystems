"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { JsonCodeEditor } from "@/components/shared/JsonCodeEditor";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSave, faSpinner, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { parseJsonOptional } from "../utils/validateJson";
import type { UiSchema } from "../types";

const DEFAULT_UI_SCHEMA: UiSchema = {
  sections: [
    {
      component: "SectionWrapper",
      props: { title: "Overview", number: 1 },
      children: [],
    },
  ],
};

type RunOutputFormProps = {
  /** Edit mode: report (run output) id */
  reportId?: string;
  /** Create mode: run id to attach the new output to */
  runId?: string;
  initialUiSchema: UiSchema | null;
  reportViewHref?: string;
};

export function RunOutputForm({
  reportId,
  runId,
  initialUiSchema,
  reportViewHref,
}: RunOutputFormProps) {
  const router = useRouter();
  const isEdit = !!reportId;
  const [uiSchemaText, setUiSchemaText] = useState(() =>
    initialUiSchema === null ? "" : JSON.stringify(initialUiSchema, null, 2)
  );
  const [uiSchemaError, setUiSchemaError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const validateAndSave = useCallback(async () => {
    setUiSchemaError(null);
    setSubmitError(null);

    const result = parseJsonOptional(uiSchemaText);
    if (result.error) {
      setUiSchemaError(result.error);
      return;
    }

    setSaving(true);
    try {
      if (isEdit && reportId) {
        const body =
          result.data === null ? { ui_schema: null } : { ui_schema: result.data as Record<string, unknown> };
        const res = await fetch(`/api/intel/reports/${reportId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setSubmitError(data.error || "Failed to save");
          return;
        }
        router.refresh();
        if (reportViewHref) {
          router.push(reportViewHref);
        } else if (runId) {
          router.push(`/intel/research/${runId}/result`);
        } else {
          router.push("/intel/research");
        }
      } else if (!isEdit && runId) {
        const body = {
          run_id: runId,
          output_json: {},
          ui_schema: result.data === null ? null : (result.data as Record<string, unknown>),
        };
        const res = await fetch("/api/intel/reports", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setSubmitError(data.error || "Failed to create");
          return;
        }
        router.refresh();
        if (runId) {
          router.push(`/intel/research/${runId}/result`);
        } else {
          router.push("/intel/research");
        }
      }
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }, [reportId, runId, isEdit, uiSchemaText, reportViewHref, router]);

  const fillExample = () => {
    setUiSchemaText(JSON.stringify(DEFAULT_UI_SCHEMA, null, 2));
    setUiSchemaError(null);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Link href="/intel/research">
          <Button variant="ghost" size="icon" title="Back to research">
            <FontAwesomeIcon icon={faArrowLeft} className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-xl font-semibold">{isEdit ? "Edit run output" : "Create run output"}</h1>
        {isEdit && reportViewHref && (
          <Link href={reportViewHref}>
            <Button variant="outline" size="sm">
              View report
            </Button>
          </Link>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <Label htmlFor="ui_schema">UI schema (optional)</Label>
          <Button type="button" variant="ghost" size="sm" onClick={fillExample}>
            Use example
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Component rendering instructions. Leave empty for none. Valid JSON only.
        </p>
        <JsonCodeEditor
          id="ui_schema"
          value={uiSchemaText}
          onChange={setUiSchemaText}
          placeholder='{ "sections": [] }'
          error={!!uiSchemaError}
          minHeight="320px"
          className="font-mono text-sm"
        />
        {uiSchemaError && (
          <p className="text-sm text-destructive" role="alert">
            {uiSchemaError}
          </p>
        )}
      </div>

      {submitError && (
        <p className="text-sm text-destructive" role="alert">
          {submitError}
        </p>
      )}

      <div className="flex gap-2">
        <Button onClick={validateAndSave} disabled={saving}>
          {saving ? (
            <>
              <FontAwesomeIcon icon={faSpinner} className="h-4 w-4 animate-spin mr-2" />
              Saving…
            </>
          ) : (
            <>
              <FontAwesomeIcon icon={faSave} className="h-4 w-4 mr-2" />
              Save
            </>
          )}
        </Button>
        <Link href="/intel/research">
          <Button variant="outline">Cancel</Button>
        </Link>
      </div>
    </div>
  );
}

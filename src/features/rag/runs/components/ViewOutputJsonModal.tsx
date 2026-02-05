"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { ModalShell } from "@/components/shared/ModalShell";
import { JsonCodeEditor } from "@/components/shared/JsonCodeEditor";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy, faCode, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

type ViewOutputJsonModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reportId: string;
};

export function ViewOutputJsonModal({
  open,
  onOpenChange,
  reportId,
}: ViewOutputJsonModalProps) {
  const [jsonString, setJsonString] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCopying, setIsCopying] = useState(false);

  useEffect(() => {
    if (!open || !reportId) return;

    setLoading(true);
    setError(null);
    setJsonString("");

    const fetchReport = async () => {
      try {
        const supabase = createClient();
        const { data: sessionData } = await supabase.auth.getSession();
        const accessToken = sessionData?.session?.access_token;

        const response = await fetch(`/api/intel/reports/${reportId}`, {
          headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
        });

        if (!response.ok) {
          const err = await response.json().catch(() => ({}));
          throw new Error(err.error || "Failed to load report");
        }

        const data = await response.json();
        const outputJson = data?.output_json;
        if (outputJson == null) {
          setError("No output JSON available");
          return;
        }

        const formatted =
          typeof outputJson === "string"
            ? outputJson
            : JSON.stringify(outputJson, null, 2);
        setJsonString(formatted);
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "Failed to load output JSON";
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [open, reportId]);

  const handleCopy = async () => {
    if (!jsonString || isCopying) return;
    setIsCopying(true);
    try {
      await navigator.clipboard.writeText(jsonString);
      toast.success("Output JSON copied to clipboard");
    } catch {
      toast.error("Failed to copy to clipboard");
    } finally {
      setIsCopying(false);
    }
  };

  return (
    <ModalShell
      open={open}
      onOpenChange={onOpenChange}
      title="Output JSON"
      titleIcon={<FontAwesomeIcon icon={faCode} className="w-5 h-5 md:w-6 md:h-6" />}
      description="View run output as formatted JSON"
      maxWidth="4xl"
      maxHeight="90vh"
      showScroll
      noBodyPadding
      footer={
        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCopy}
            disabled={!jsonString || isCopying}
          >
            <FontAwesomeIcon icon={faCopy} className="h-4 w-4 mr-2" />
            {isCopying ? "Copying…" : "Copy"}
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      }
    >
      <div className="p-4 md:p-6">
        {loading && (
          <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground">
            <FontAwesomeIcon icon={faSpinner} className="h-5 w-5 animate-spin" />
            <span>Loading output JSON…</span>
          </div>
        )}
        {error && !loading && (
          <div className="py-8 text-center text-destructive">{error}</div>
        )}
        {jsonString && !loading && (
          <div className="rounded-lg border border-border overflow-hidden w-full min-w-0">
            <JsonCodeEditor
              value={jsonString}
              onChange={() => {}}
              readOnly
              lineWrapping
              minHeight="300px"
              maxHeight="60vh"
              className="border-0"
            />
          </div>
        )}
      </div>
    </ModalShell>
  );
}

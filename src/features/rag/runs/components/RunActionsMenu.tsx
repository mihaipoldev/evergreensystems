"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ActionMenu } from "@/components/shared/ActionMenu";
import { DeleteConfirmationDialog } from "@/features/rag/shared/components/DeleteConfirmationDialog";
import { ViewOutputJsonModal } from "./ViewOutputJsonModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCode, faCopy, faDownload, faEllipsis, faEye, faExternalLink, faFileAlt, faTrash } from "@fortawesome/free-solid-svg-icons";
import { downloadOutputJson } from "../utils/downloadOutputJson";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { Run } from "../types";
import { getRunLabel } from "../types";

interface RunActionsMenuProps {
  run: Run & { knowledge_base_name?: string | null; report_id?: string | null };
  onDelete?: () => void;
}

export function RunActionsMenu({
  run,
  onDelete,
}: RunActionsMenuProps) {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showViewJsonModal, setShowViewJsonModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isComplete = run.status === "complete";
  const reportId = run.report_id;
  // Use workflow label if available
  const runLabel = getRunLabel(run);

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
      if (onDelete) {
        onDelete();
      } else {
        router.refresh();
      }
    } catch (error: any) {
      console.error("Error deleting run:", error);
      toast.error(error.message || "Failed to delete run");
    } finally {
      setIsDeleting(false);
    }
  };

  const items = [
    {
      label: "Progress",
      icon: <FontAwesomeIcon icon={faEye} className="h-4 w-4" />,
      href: `/intel/research/${run.id}`,
      onClick: (e?: React.MouseEvent) => {
        e?.stopPropagation();
      },
    },
    {
      label: "Result",
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
            label: "Execution",
            icon: <FontAwesomeIcon icon={faExternalLink} className="h-4 w-4" />,
            onClick: (e?: React.MouseEvent) => {
              e?.stopPropagation();
              window.open(run.execution_url!, "_blank");
            },
          },
        ]
      : []),
    {
      label: "Output JSON",
      icon: <FontAwesomeIcon icon={faCode} className="h-4 w-4" />,
      onClick: (e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (isComplete && reportId) {
          setShowViewJsonModal(true);
        } else {
          toast.info("Output JSON will be available after the run completes");
        }
      },
      disabled: !isComplete || !reportId,
    },
    {
      label: "Download JSON",
      icon: <FontAwesomeIcon icon={faDownload} className="h-4 w-4" />,
      onClick: async (e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (!isComplete || !reportId) {
          toast.info("Output JSON will be available after the run completes");
          return;
        }
        try {
          await downloadOutputJson(reportId, `run-${run.id}.json`);
          toast.success("JSON downloaded");
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : "Failed to download JSON";
          toast.error(message);
        }
      },
      disabled: !isComplete || !reportId,
    },
    {
      label: "Copy ID",
      icon: <FontAwesomeIcon icon={faCopy} className="h-4 w-4" />,
      onClick: async (e?: React.MouseEvent) => {
        e?.stopPropagation();
        try {
          await navigator.clipboard.writeText(run.id);
          toast.success("ID copied to clipboard");
        } catch {
          toast.error("Failed to copy ID");
        }
      },
    },
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

  return (
    <>
      <ActionMenu
        trigger={
          <button
            onClick={(e) => e.stopPropagation()}
            className="h-9 w-9 rounded-full hover:text-primary flex items-center justify-center shrink-0 cursor-pointer transition-all"
          >
            <FontAwesomeIcon
              icon={faEllipsis}
              className="h-4 w-4"
            />
          </button>
        }
        items={items}
        align="end"
      />

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

      {reportId && (
        <ViewOutputJsonModal
          open={showViewJsonModal}
          onOpenChange={setShowViewJsonModal}
          reportId={reportId}
        />
      )}
    </>
  );
}


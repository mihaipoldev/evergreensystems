"use client";

import { ActionMenu } from "@/components/shared/ActionMenu";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCopy,
  faEllipsis,
  faEye,
  faDownload,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "sonner";
import type { RAGDocument } from "../document-types";

interface DocumentActionsMenuProps {
  document: RAGDocument;
  onView?: () => void;
  onCopy?: () => void;
  onDownload?: () => void;
  onDelete?: () => void;
}

export function DocumentActionsMenu({
  document,
  onView,
  onCopy,
  onDownload,
  onDelete,
}: DocumentActionsMenuProps) {
  const items = [];

  if (onView) {
    items.push({
      label: "View",
      icon: <FontAwesomeIcon icon={faEye} className="h-4 w-4" />,
      onClick: onView,
    });
  }

  if (onCopy) {
    items.push({
      label: "Copy document",
      icon: <FontAwesomeIcon icon={faCopy} className="h-4 w-4" />,
      onClick: onCopy,
    });
  }

  if (onDownload) {
    items.push({
      label: "Download",
      icon: <FontAwesomeIcon icon={faDownload} className="h-4 w-4" />,
      onClick: onDownload,
    });
  }

  items.push({
    label: "Copy ID",
    icon: <FontAwesomeIcon icon={faCopy} className="h-4 w-4" />,
    onClick: async (e?: React.MouseEvent) => {
      e?.stopPropagation();
      try {
        await navigator.clipboard.writeText(document.id);
        toast.success("ID copied to clipboard");
      } catch {
        toast.error("Failed to copy ID");
      }
    },
  });

  if (onDelete) {
    items.push(
      { separator: true },
      {
        label: "Delete",
        icon: <FontAwesomeIcon icon={faTrash} className="h-4 w-4" />,
        onClick: onDelete,
        destructive: true,
      }
    );
  }

  return (
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
  );
}


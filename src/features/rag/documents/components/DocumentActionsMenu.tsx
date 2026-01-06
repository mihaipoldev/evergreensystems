"use client";

import { ActionMenu } from "@/components/shared/ActionMenu";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEllipsis,
  faEye,
  faDownload,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import type { RAGDocument } from "../document-types";

interface DocumentActionsMenuProps {
  document: RAGDocument;
  onView?: () => void;
  onDownload?: () => void;
  onDelete?: () => void;
}

export function DocumentActionsMenu({
  document,
  onView,
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

  if (onDownload) {
    items.push({
      label: "Download",
      icon: <FontAwesomeIcon icon={faDownload} className="h-4 w-4" />,
      onClick: onDownload,
    });
  }

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


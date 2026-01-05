"use client";

import { ActionMenu } from "@/components/shared/ActionMenu";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEllipsisVertical,
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
          className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-primary/10 hover:shadow-icon transition-all cursor-pointer"
        >
          <FontAwesomeIcon
            icon={faEllipsisVertical}
            className="h-4 w-4 text-foreground"
          />
        </button>
      }
      items={items}
      align="end"
    />
  );
}


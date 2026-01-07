"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ActionMenu } from "@/components/shared/ActionMenu";
import { DeleteConfirmationDialog } from "@/features/rag/shared/components/DeleteConfirmationDialog";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsis, faPencil, faTrash } from "@fortawesome/free-solid-svg-icons";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { ProjectType } from "../types";

interface ProjectTypeActionsMenuProps {
  projectType: ProjectType;
  onDelete?: () => void;
  onEdit?: (projectType: ProjectType) => void;
}

export function ProjectTypeActionsMenu({
  projectType,
  onDelete,
  onEdit,
}: ProjectTypeActionsMenuProps) {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (isDeleting) return;

    setIsDeleting(true);
    try {
      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      const response = await fetch(`/api/intel/project-types/${projectType.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete project type");
      }

      toast.success("Project type deleted successfully");
      setShowDeleteDialog(false);
      if (onDelete) {
        onDelete();
      } else {
        router.push("/intel/project-types");
        router.refresh();
      }
    } catch (error: any) {
      console.error("Error deleting project type:", error);
      toast.error(error.message || "Failed to delete project type");
    } finally {
      setIsDeleting(false);
    }
  };

  const items = [
    {
      label: "Edit",
      icon: <FontAwesomeIcon icon={faPencil} className="h-4 w-4" />,
      onClick: (e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (onEdit) {
          onEdit(projectType);
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
        entityName={projectType.label}
        entityType="project type"
        onConfirm={handleDelete}
        isDeleting={isDeleting}
      />
    </>
  );
}


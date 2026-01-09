"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ActionMenu } from "@/components/shared/ActionMenu";
import { DeleteConfirmationDialog } from "@/features/rag/shared/components/DeleteConfirmationDialog";
import { GenerateReportModal } from "@/features/rag/workflows/components/GenerateReportModal";
import { useBulkSelectionOptional } from "@/features/rag/shared/contexts/BulkSelectionContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsis, faPencil, faTrash, faWandMagicSparkles, faCheck } from "@fortawesome/free-solid-svg-icons";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { Project } from "../types";
import type { ProjectType } from "@/features/rag/project-type/types";

interface ProjectActionsMenuProps {
  project: Project;
  projectTypes?: ProjectType[];
  projectTypeName?: string | null;
  onDelete?: () => void;
  onEdit?: (project: Project) => void;
}

export function ProjectActionsMenu({
  project,
  projectTypes = [],
  projectTypeName,
  onDelete,
  onEdit,
}: ProjectActionsMenuProps) {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  
  // Get the project type name from the project's project_type_id
  const projectType = project.project_type_id 
    ? projectTypes.find(pt => pt.id === project.project_type_id)
    : null;
  const effectiveProjectTypeName = projectTypeName || projectType?.name || null;
  
  // Use bulk selection context (optional - may not be available outside list view)
  const bulkSelection = useBulkSelectionOptional();
  const selected = bulkSelection ? bulkSelection.isSelected(project.id) : false;

  const handleDelete = async () => {
    if (isDeleting) return;

    setIsDeleting(true);
    try {
      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      const response = await fetch(`/api/intel/projects/${project.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete project");
      }

      toast.success("Project deleted successfully");
      setShowDeleteDialog(false);
      if (onDelete) {
        onDelete();
      } else {
        router.push("/intel/projects");
        router.refresh();
      }
    } catch (error: any) {
      console.error("Error deleting project:", error);
      toast.error(error.message || "Failed to delete project");
    } finally {
      setIsDeleting(false);
    }
  };

  const items = [
    // Only show Select option if bulk selection context is available
    ...(bulkSelection ? [{
      label: selected ? "Deselect" : "Select",
      icon: <FontAwesomeIcon icon={faCheck} className="h-4 w-4" />,
      onClick: (e?: React.MouseEvent) => {
        e?.stopPropagation();
        bulkSelection.toggleSelection(project.id);
      },
    }, { separator: true }] : []),
    {
      label: "Generate",
      icon: <FontAwesomeIcon icon={faWandMagicSparkles} className="h-4 w-4" />,
      onClick: (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setIsGenerateModalOpen(true);
      },
    },
    {
      label: "Edit",
      icon: <FontAwesomeIcon icon={faPencil} className="h-4 w-4" />,
      onClick: (e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (onEdit) {
          onEdit(project);
        } else {
          router.push(`/intel/projects/${project.id}/edit`);
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
        entityName={project.client_name ?? undefined}
        entityType="project"
        onConfirm={handleDelete}
        isDeleting={isDeleting}
      />

      <GenerateReportModal
        open={isGenerateModalOpen}
        onOpenChange={setIsGenerateModalOpen}
        projectType={effectiveProjectTypeName}
        projectTypeId={project.project_type_id || null}
        researchSubjectId={project.id}
        researchSubjectName={project.name || project.client_name || ""}
        researchSubjectGeography={project.geography || null}
        researchSubjectDescription={project.description || null}
        researchSubjectCategory={project.category || null}
      />
    </>
  );
}


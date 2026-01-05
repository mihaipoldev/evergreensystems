"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ActionMenu } from "@/components/shared/ActionMenu";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisVertical, faPencil, faTrash, faCog } from "@fortawesome/free-solid-svg-icons";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface KnowledgeBasePageActionsProps {
  knowledgeBaseId: string;
  knowledgeBaseName: string;
}

export function KnowledgeBasePageActions({
  knowledgeBaseId,
  knowledgeBaseName,
}: KnowledgeBasePageActionsProps) {
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

      const response = await fetch(`/api/intel/knowledge-base/${knowledgeBaseId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete knowledge base");
      }

      toast.success("Knowledge base deleted successfully");
      setShowDeleteDialog(false);
      router.push("/intel/knowledge-bases");
      router.refresh();
    } catch (error: any) {
      console.error("Error deleting knowledge base:", error);
      toast.error(error.message || "Failed to delete knowledge base");
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
        router.push(`/intel/knowledge-bases/${knowledgeBaseId}/edit`);
      },
    },
    {
      label: "Settings",
      icon: <FontAwesomeIcon icon={faCog} className="h-4 w-4" />,
      href: `/intel/knowledge-bases/${knowledgeBaseId}/edit`,
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
            className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-primary/10 hover:shadow-icon transition-all shrink-0 cursor-pointer"
          >
            <FontAwesomeIcon
              icon={faEllipsisVertical}
              className="h-5 w-5 text-foreground"
            />
          </button>
        }
        items={items}
        align="end"
      />

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the knowledge base &quot;{knowledgeBaseName}&quot;.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}


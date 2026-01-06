"use client";

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

type DeleteConfirmationDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  entityName?: string;
  entityType?: string; // e.g., "document", "knowledge base", "project"
  onConfirm: () => void;
  isDeleting?: boolean;
  confirmLabel?: string;
  cancelLabel?: string;
};

export function DeleteConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  entityName,
  entityType = "item",
  onConfirm,
  isDeleting = false,
  confirmLabel,
  cancelLabel = "Cancel",
}: DeleteConfirmationDialogProps) {
  // Generate default title if not provided
  const dialogTitle = title || `Delete ${entityType}?`;

  // Generate default description if not provided
  const dialogDescription =
    description ||
    (entityName
      ? `This action cannot be undone. This will permanently delete the ${entityType} "${entityName}".`
      : `This action cannot be undone. This will permanently delete this ${entityType}.`);

  const confirmButtonLabel = confirmLabel || (isDeleting ? "Deleting..." : "Delete");

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{dialogTitle}</AlertDialogTitle>
          <AlertDialogDescription>{dialogDescription}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>{cancelLabel}</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {confirmButtonLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}


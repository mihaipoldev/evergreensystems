"use client";

import { useState } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

type DeleteConfirmationDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  entityName?: string;
  entityType?: string; // e.g., "document", "knowledge base", "project"
  onConfirm: (deleteDocuments?: boolean) => void;
  isDeleting?: boolean;
  confirmLabel?: string;
  cancelLabel?: string;
  showDeleteDocumentsOption?: boolean;
  deleteDocumentsLabel?: string;
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
  showDeleteDocumentsOption = false,
  deleteDocumentsLabel = "Also delete associated documents",
}: DeleteConfirmationDialogProps) {
  const [deleteDocuments, setDeleteDocuments] = useState(false);

  // Reset checkbox when dialog closes
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setDeleteDocuments(false);
    }
    onOpenChange(newOpen);
  };

  // Generate default title if not provided
  const dialogTitle = title || `Delete ${entityType}?`;

  // Generate default description if not provided
  const dialogDescription =
    description ||
    (entityName
      ? `This action cannot be undone. This will permanently delete the ${entityType} "${entityName}".`
      : `This action cannot be undone. This will permanently delete this ${entityType}.`);

  const confirmButtonLabel = confirmLabel || (isDeleting ? "Deleting..." : "Delete");

  const handleConfirm = () => {
    onConfirm(showDeleteDocumentsOption ? deleteDocuments : undefined);
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="max-h-screen md:max-h-auto !flex !flex-col">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-base md:text-lg">{dialogTitle}</AlertDialogTitle>
          <AlertDialogDescription className="text-sm">{dialogDescription}</AlertDialogDescription>
        </AlertDialogHeader>
        {showDeleteDocumentsOption && (
          <div className="flex items-center space-x-2 py-3 md:py-4">
            <Checkbox
              id="delete-documents"
              checked={deleteDocuments}
              onCheckedChange={(checked) => setDeleteDocuments(checked === true)}
              disabled={isDeleting}
            />
            <Label
              htmlFor="delete-documents"
              className="text-sm font-normal cursor-pointer"
            >
              {deleteDocumentsLabel}
            </Label>
          </div>
        )}
        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel 
            disabled={isDeleting}
            className="hover:bg-secondary hover:text-secondary-foreground"
          >
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
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


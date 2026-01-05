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
import type { RAGDocument } from "../document-types";

type RemoveDocumentDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: RAGDocument | null;
  onConfirm: () => void;
};

export function RemoveDocumentDialog({
  open,
  onOpenChange,
  document,
  onConfirm,
}: RemoveDocumentDialogProps) {
  if (!document) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove document?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently remove &quot;{document.title || "Untitled document"}&quot; and all its 
            associated chunks and embeddings from the knowledge base. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Remove
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}


"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisVertical, faTrash, faCopy } from "@fortawesome/free-solid-svg-icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
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
import { useDeletePage, useDuplicatePage } from "../hooks";

type PageActionMenuProps = {
  pageId: string;
};

export function PageActionMenu({ pageId }: PageActionMenuProps) {
  const router = useRouter();
  const deletePage = useDeletePage();
  const duplicatePage = useDuplicatePage();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDelete = async () => {
    try {
      await deletePage.mutateAsync(pageId);
      toast.success("Page deleted successfully");
      router.push("/admin/pages");
      router.refresh();
    } catch (error: any) {
      console.error("Error deleting page:", error);
      toast.error(error.message || "Failed to delete page");
    } finally {
      setShowDeleteDialog(false);
    }
  };

  const handleDuplicate = async () => {
    try {
      const duplicatedPage = await duplicatePage.mutateAsync(pageId);
      toast.success("Page duplicated successfully");
      // Navigate to the duplicated page
      if (duplicatedPage?.id) {
        router.push(`/admin/pages/${duplicatedPage.id}/edit`);
        router.refresh();
      }
    } catch (error: any) {
      console.error("Error duplicating page:", error);
      toast.error(error.message || "Failed to duplicate page");
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
          >
            <FontAwesomeIcon icon={faEllipsisVertical} className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleDuplicate} disabled={duplicatePage.isPending}>
            <FontAwesomeIcon icon={faCopy} className="mr-2 h-4 w-4" />
            Duplicate
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setShowDeleteDialog(true)}
            disabled={deletePage.isPending}
            className="text-destructive focus:text-destructive"
          >
            <FontAwesomeIcon icon={faTrash} className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the page
              and all its associated sections.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}


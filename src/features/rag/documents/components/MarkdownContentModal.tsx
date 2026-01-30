"use client";

import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { MarkdownRenderer } from "@/features/rag/shared/components";
import { ModalShell } from "@/components/shared/ModalShell";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileLines } from "@fortawesome/free-solid-svg-icons";

type MarkdownContentModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  content: string;
};

export function MarkdownContentModal({
  open,
  onOpenChange,
  title,
  content,
}: MarkdownContentModalProps) {
  return (
    <ModalShell
      open={open}
      onOpenChange={onOpenChange}
      title={title || "Document Content"}
      titleIcon={<FontAwesomeIcon icon={faFileLines} className="w-5 h-5 md:w-6 md:h-6" />}
      description="View document content"
      maxWidth="4xl"
      maxHeight="90vh"
      showScroll
      footer={
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      }
    >
      <div className="max-h-[calc(100vh-8rem)] md:max-h-[800px] overflow-y-auto my-2">
        <MarkdownRenderer content={content} className="p-0 py-3 md:py-4" />
      </div>
    </ModalShell>
  );
}


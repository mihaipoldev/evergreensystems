"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { MarkdownRenderer } from "@/features/rag/shared/components";
import { ModalShell } from "@/components/shared/ModalShell";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy, faFileLines } from "@fortawesome/free-solid-svg-icons";
import { toast } from "sonner";

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
  const [isCopying, setIsCopying] = useState(false);

  const handleCopy = async () => {
    if (!content || isCopying) return;
    setIsCopying(true);
    try {
      await navigator.clipboard.writeText(content);
      toast.success("Document copied to clipboard");
    } catch (error) {
      toast.error("Failed to copy to clipboard");
    } finally {
      setIsCopying(false);
    }
  };

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
      noBodyPadding
      footer={
        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCopy}
            disabled={!content || isCopying}
          >
            <FontAwesomeIcon icon={faCopy} className="h-4 w-4 mr-2" />
            {isCopying ? "Copying…" : "Copy"}
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      }
    >
      <div className="max-h-[calc(100vh-8rem)] md:max-h-[800px] overflow-y-auto">
        <MarkdownRenderer content={content} className="p-4 md:p-6" />
      </div>
    </ModalShell>
  );
}


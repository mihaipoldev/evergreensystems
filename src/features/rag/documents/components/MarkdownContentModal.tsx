"use client";

import { Button } from "@/components/ui/button";
import { MarkdownRenderer, RAGModal } from "@/features/rag/shared/components";

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
    <RAGModal
      open={open}
      onOpenChange={onOpenChange}
      title={title || "Document Content"}
      maxWidth="md:max-w-[800px]"
      footer={
        <Button
          className="shadow-buttons border-none"
          onClick={() => onOpenChange(false)}
        >
          Close
        </Button>
      }
    >
      <div className="max-h-[calc(100vh-8rem)] md:max-h-[800px] overflow-y-auto my-2">
        <MarkdownRenderer content={content} className="p-0 py-3 md:py-4" />
      </div>
    </RAGModal>
  );
}


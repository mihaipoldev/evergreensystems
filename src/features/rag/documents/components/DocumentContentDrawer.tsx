"use client";

import { Button } from "@/components/ui/button";
import { MarkdownRenderer, RAGDrawer } from "@/features/rag/shared/components";

type DocumentContentDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  content: string;
};

export function DocumentContentDrawer({
  open,
  onOpenChange,
  title,
  content,
}: DocumentContentDrawerProps) {
  return (
    <RAGDrawer
      open={open}
      onOpenChange={onOpenChange}
      title={title || "Document Content"}
      footer={
        <Button
          className="shadow-buttons border-none"
          onClick={() => onOpenChange(false)}
        >
          Close
        </Button>
      }
    >
      <MarkdownRenderer content={content} />
    </RAGDrawer>
  );
}


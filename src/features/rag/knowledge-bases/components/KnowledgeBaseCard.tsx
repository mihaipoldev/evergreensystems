"use client";

import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBook, faEllipsisVertical, faLock, faGlobe } from "@fortawesome/free-solid-svg-icons";
import { ActionMenu } from "@/components/admin/ui/ActionMenu";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { KnowledgeBase } from "../types";

type KnowledgeBaseCardProps = {
  knowledge: KnowledgeBase;
  documentCount?: number;
  onDelete?: () => void;
};

export function KnowledgeBaseCard({ knowledge, documentCount = 0, onDelete }: KnowledgeBaseCardProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const formattedDate = new Date(knowledge.updated_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const handleDelete = async (id: string) => {
    if (isDeleting) return;
    
    setIsDeleting(true);
    try {
      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      const response = await fetch(`/api/admin/knowledge-base/${id}`, {
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
      if (onDelete) {
        onDelete();
      } else {
        router.refresh();
      }
    } catch (error: any) {
      console.error("Error deleting knowledge base:", error);
      toast.error(error.message || "Failed to delete knowledge base");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="group relative rounded-xl bg-card/50 border border-border/40 p-6 transition-all hover:bg-card hover:border-border/60 hover:shadow-md h-full flex flex-col">
      <div className="absolute top-4 right-4 z-10" onClick={(e) => e.stopPropagation()}>
        <ActionMenu
          itemId={knowledge.id}
          editHref={`/admin/knowledge-base/${knowledge.id}/edit`}
          onDelete={handleDelete}
          deleteLabel={`knowledge base "${knowledge.name}"`}
        />
      </div>

      <Link
        href={`/admin/knowledge-base/${knowledge.id}`}
        className="flex flex-col items-center text-center flex-1"
      >
        <div className="mb-4 mt-2">
          <div className="h-16 w-16 rounded-full flex items-center justify-center bg-primary/10 mx-auto">
            <FontAwesomeIcon icon={faBook} className="h-8 w-8 text-primary" />
          </div>
        </div>

        <h3 className="text-base font-semibold text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-2 mb-3 px-2">
          {knowledge.name}
        </h3>

        <div className="mt-auto pt-2 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <FontAwesomeIcon 
              icon={knowledge.visibility === "public" ? faGlobe : faLock} 
              className="h-3 w-3"
            />
            <span className="text-xs capitalize">{knowledge.visibility}</span>
          </div>
          <span>•</span>
          <span>{formattedDate}</span>
          <span>•</span>
          <span>{documentCount} {documentCount === 1 ? "source" : "sources"}</span>
        </div>
      </Link>
    </div>
  );
}


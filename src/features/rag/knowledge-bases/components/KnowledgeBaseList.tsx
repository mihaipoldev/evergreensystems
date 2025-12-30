"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { AdminToolbar } from "@/components/admin/ui/AdminToolbar";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { KnowledgeBaseCard } from "./KnowledgeBaseCard";
import { useRouter } from "next/navigation";
import type { KnowledgeBaseWithCount } from "../data";

type KnowledgeBaseListProps = {
  initialKnowledge: KnowledgeBaseWithCount[];
};

export function KnowledgeBaseList({ initialKnowledge }: KnowledgeBaseListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const filteredKnowledge = useMemo(() => {
    if (!searchQuery.trim()) {
      return initialKnowledge;
    }

    const query = searchQuery.toLowerCase();
    return initialKnowledge.filter((knowledge) =>
      knowledge.name.toLowerCase().includes(query) ||
      (knowledge.description && knowledge.description.toLowerCase().includes(query))
    );
  }, [initialKnowledge, searchQuery]);

  return (
    <div className="w-full space-y-6">
      <div className="space-y-3 md:space-y-4">
        <AdminToolbar
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search Knowledge Bases..."
        >
          <Button
            asChild
            variant="ghost"
            className="rounded-full w-10 h-10 p-0 bg-transparent text-muted-foreground hover:text-primary hover:bg-transparent border-0 shadow-none transition-colors"
            title="New Knowledge Base"
          >
            <Link href="/admin/ai-knowledge/new">
              <FontAwesomeIcon icon={faPlus} className="h-5 w-5" />
            </Link>
          </Button>
        </AdminToolbar>

        {filteredKnowledge.length === 0 && initialKnowledge.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link
              href="/admin/ai-knowledge/new"
              className="block group"
            >
              <div className="rounded-xl bg-card/50 border border-border/40 p-8 text-center transition-all hover:bg-card hover:border-border/60 hover:shadow-md h-full min-h-[240px] flex flex-col items-center justify-center">
                <div className="h-20 w-20 rounded-full flex items-center justify-center bg-primary/10 mb-4">
                  <FontAwesomeIcon icon={faPlus} className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Create new notebook
                </h3>
              </div>
            </Link>
          </div>
        ) : filteredKnowledge.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/60 bg-muted/30 p-8 text-center text-muted-foreground">
            No Knowledge Bases found matching your search
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredKnowledge.map((knowledge) => (
              <KnowledgeBaseCard 
                key={knowledge.id} 
                knowledge={knowledge}
                documentCount={knowledge.document_count || 0}
                onDelete={() => router.refresh()}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


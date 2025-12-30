"use client";

import { useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { ActionMenu } from "@/components/admin/ui/ActionMenu";
import { AdminToolbar } from "@/components/admin/ui/AdminToolbar";
import { CardListContainer } from "@/components/admin/ui/CardListContainer";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faCode } from "@fortawesome/free-solid-svg-icons";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type { Software } from "../types";

type SoftwaresListProps = {
  initialSoftwares: Software[];
};

export function SoftwaresList({ initialSoftwares }: SoftwaresListProps) {
  const [softwares, setSoftwares] = useState<Software[]>(initialSoftwares);
  const [searchQuery, setSearchQuery] = useState("");

  const handleDelete = useCallback(async (id: string) => {
    try {
      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      const response = await fetch(`/api/admin/softwares/${id}`, {
        method: "DELETE",
        headers: {
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete software");
      }

      toast.success("Software deleted successfully");
      setSoftwares((prev) => prev.filter((item) => item.id !== id));
    } catch (error: any) {
      console.error("Error deleting software:", error);
      toast.error(error.message || "Failed to delete software");
      throw error;
    }
  }, []);

  const filteredSoftwares = useMemo(() => {
    return softwares.filter((item) => {
      const query = searchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(query) ||
        item.slug.toLowerCase().includes(query) ||
        item.website_url.toLowerCase().includes(query)
      );
    });
  }, [softwares, searchQuery]);

  const renderContent = useCallback((software: Software) => {
    return (
      <div className="flex items-center gap-3">
        {software.icon ? (
          <div className="h-12 w-12 rounded-full overflow-hidden flex items-center justify-center shadow-md flex-shrink-0 bg-muted">
            <img
              src={software.icon}
              alt={software.name}
              className="h-8 w-8 object-contain"
              onError={(e) => {
                // Fallback to icon if image fails to load
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
                const fallback = document.createElement("div");
                fallback.className = "h-6 w-6 text-primary";
                fallback.innerHTML = `<svg class="h-6 w-6" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2L3 7v11h4v-6h6v6h4V7l-7-5z"/></svg>`;
                target.parentElement?.appendChild(fallback);
              }}
            />
          </div>
        ) : (
          <div className="h-12 w-12 rounded-full overflow-hidden flex items-center justify-center shadow-md flex-shrink-0 bg-muted">
            <FontAwesomeIcon
              icon={faCode}
              className="h-6 w-6 text-primary"
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <Link
            href={`/admin/softwares/${software.id}/edit`}
            className="text-base font-semibold text-foreground leading-snug hover:text-primary transition-colors cursor-pointer"
          >
            {software.name}
          </Link>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium">Slug:</span> {software.slug}
            </p>
            <span className="text-muted-foreground">•</span>
            <p className="text-sm text-muted-foreground truncate">
              {software.website_url}
            </p>
          </div>
        </div>
      </div>
    );
  }, []);

  const renderActions = useCallback((software: Software) => {
    return (
      <ActionMenu
        itemId={software.id}
        editHref={`/admin/softwares/${software.id}/edit`}
        onDelete={handleDelete}
        deleteLabel={`Software "${software.name}"`}
      />
    );
  }, [handleDelete]);

  return (
    <div className="w-full">
      <div className="mb-6 md:mb-8">
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-3 mb-2">
            <h1 className="text-4xl font-bold text-foreground leading-none">Softwares</h1>
            <span className="inline-flex items-center justify-center h-5 px-2.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 leading-none">
              ({filteredSoftwares.length} {filteredSoftwares.length === 1 ? "software" : "softwares"})
            </span>
          </div>
          <p className="text-base text-muted-foreground">
            Manage software products and their information.
          </p>
        </div>
      </div>
      <div className="space-y-3 md:space-y-4">
        <AdminToolbar
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search softwares..."
        >
          <Button
            asChild
            variant="ghost"
            className="rounded-full w-10 h-10 p-0 bg-transparent text-muted-foreground hover:text-primary hover:bg-transparent border-0 shadow-none transition-colors"
            title="New Software"
          >
            <Link href="/admin/softwares/new">
              <FontAwesomeIcon icon={faPlus} className="h-5 w-5" />
            </Link>
          </Button>
        </AdminToolbar>

        {filteredSoftwares.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/60 bg-muted/30 p-8 text-center text-muted-foreground">
            {searchQuery
              ? "No softwares found matching your search"
              : "No softwares found"}
          </div>
        ) : (
          <div className="space-y-2">
            <CardListContainer
              items={filteredSoftwares}
              renderContent={renderContent}
              renderActions={renderActions}
            />
          </div>
        )}
      </div>
    </div>
  );
}

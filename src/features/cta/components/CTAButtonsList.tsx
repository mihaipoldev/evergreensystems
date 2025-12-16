"use client";

import { useMemo, useState, useCallback } from "react";
import Link from "next/link";
import { CardList } from "@/components/admin/CardList";
import { ActionMenu } from "@/components/admin/ActionMenu";
import { AdminToolbar } from "@/components/admin/AdminToolbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faLink } from "@fortawesome/free-solid-svg-icons";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { PageSectionStatusSelector } from "@/components/admin/PageSectionStatusSelector";
import { useDuplicateCTAButton } from "@/lib/react-query/hooks/useCTAButtons";
import type { CTAButton, CTAButtonWithSections } from "../types";

type CTAButtonsListProps = {
  initialCTAButtons: CTAButtonWithSections[];
  hideHeader?: boolean;
  sectionId?: string;
  pageId?: string;
};

export function CTAButtonsList({ initialCTAButtons, hideHeader = false, sectionId, pageId }: CTAButtonsListProps) {
  const [ctaButtons, setCTAButtons] = useState<CTAButtonWithSections[]>(initialCTAButtons);
  const [searchQuery, setSearchQuery] = useState("");
  const duplicateCTAButton = useDuplicateCTAButton();

  const handleDuplicate = useCallback(async (id: string) => {
    try {
      await duplicateCTAButton.mutateAsync({ id, sectionId });
      toast.success("CTA button duplicated successfully");
      // Refresh the list by refetching
      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      const response = await fetch(`/api/admin/cta-buttons`, {
        headers: {
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
      });

      if (response.ok) {
        const updated = await response.json();
        setCTAButtons(updated);
      }
    } catch (error: any) {
      console.error("Error duplicating CTA button:", error);
      toast.error(error.message || "Failed to duplicate CTA button");
      throw error;
    }
  }, [sectionId, duplicateCTAButton]);

  const handleDelete = useCallback(async (id: string) => {
    try {
      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      const response = await fetch(`/api/admin/cta-buttons/${id}`, {
        method: "DELETE",
        headers: {
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete CTA button");
      }

      toast.success("CTA button deleted successfully");
      setCTAButtons((prev) => prev.filter((btn) => btn.id !== id));
    } catch (error: any) {
      console.error("Error deleting CTA button:", error);
      toast.error(error.message || "Failed to delete CTA button");
      throw error;
    }
  }, []);


  const filteredCTAButtons = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return ctaButtons.filter((button) => {
      const matchesText =
        button.label.toLowerCase().includes(query) ||
        button.url.toLowerCase().includes(query) ||
        button.style?.toLowerCase().includes(query) ||
        button.icon?.toLowerCase().includes(query);

      const matchesSection =
        button.sections &&
        button.sections.some((section) =>
          (section.admin_title || section.title || "").toLowerCase().includes(query)
        );

      return matchesText || matchesSection;
    });
  }, [ctaButtons, searchQuery]);

  const renderContent = useCallback((button: CTAButtonWithSections) => (
    <div className="flex flex-col gap-2">
      <div className="flex items-start justify-between gap-3">
        <Link
          href={pageId && sectionId 
            ? `/admin/cta/${button.id}/edit?returnTo=/admin/pages/${pageId}/sections/${sectionId}?tab=cta`
            : `/admin/cta/${button.id}/edit`}
          className="text-base font-semibold text-foreground leading-snug hover:text-primary transition-colors cursor-pointer"
        >
          {button.label}
        </Link>
        {(button as any).status && (
          <PageSectionStatusSelector
            status={(button as any).status}
            onStatusChange={(newStatus) => {
              // handleUpdateStatus would need to be implemented if status updates are needed
              console.warn("Status update not implemented for CTAButtonWithSections");
            }}
          />
        )}
      </div>
      <div className="flex items-center gap-2">
        {button.icon && (
          <div className="h-8 w-8 rounded-full overflow-hidden flex items-center justify-center bg-muted flex-shrink-0">
            <FontAwesomeIcon
              icon={button.icon as any}
              className="h-4 w-4 text-primary"
            />
          </div>
        )}
        <a
          href={button.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5 truncate"
          onClick={(e) => e.stopPropagation()}
        >
          <FontAwesomeIcon icon={faLink} className="h-3 w-3 flex-shrink-0" />
          <span className="truncate">{button.url}</span>
        </a>
      </div>
      {button.style && (
        <div className="text-xs text-muted-foreground">
          Style: {button.style}
        </div>
      )}
      {button.sections && button.sections.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {button.sections.map((section) => (
            <Link
              key={section.id}
              href={pageId ? `/admin/pages/${pageId}/sections/${section.id}?tab=edit` : `/admin/sections/${section.id}/edit`}
              className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground hover:text-primary hover:bg-muted/80 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="font-medium truncate max-w-[200px]">
                {section.admin_title || section.title || "Untitled section"}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  ), [pageId]);

  const renderActions = useCallback((button: CTAButtonWithSections) => {
    const editHref = pageId && sectionId 
      ? `/admin/pages/${pageId}/sections/${sectionId}/items/${button.id}/edit`
      : `/admin/cta/${button.id}/edit`;
    return (
      <ActionMenu
        itemId={button.id}
        editHref={editHref}
        onDelete={handleDelete}
        onDuplicate={handleDuplicate}
        deleteLabel={`CTA button "${button.label}"`}
      />
    );
  }, [pageId, sectionId, handleDelete, handleDuplicate]);

  return (
    <div className="w-full">
      {!hideHeader && (
          <div className="mb-6 md:mb-8">
            <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-3 mb-2">
              <h1 className="text-4xl font-bold text-foreground leading-none">CTA Buttons</h1>
              <span className="inline-flex items-center justify-center h-5 px-2.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 leading-none">
                ({filteredCTAButtons.length} {filteredCTAButtons.length === 1 ? "button" : "buttons"})
              </span>
            </div>
            <p className="text-base text-muted-foreground">
              Manage call-to-action buttons.
            </p>
          </div>
        </div>
      )}
      <div className="space-y-3 md:space-y-4">
        <AdminToolbar
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search CTA buttons..."
        >
          <Button
            asChild
            variant="ghost"
            className="rounded-full w-10 h-10 p-0 bg-transparent text-muted-foreground hover:text-primary hover:bg-transparent border-0 shadow-none transition-colors"
            title="New CTA Button"
          >
            <Link href={pageId && sectionId ? `/admin/cta/new?returnTo=/admin/pages/${pageId}/sections/${sectionId}?tab=cta` : "/admin/cta/new"}>
              <FontAwesomeIcon icon={faPlus} className="h-5 w-5" />
            </Link>
          </Button>
        </AdminToolbar>

        {filteredCTAButtons.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/60 bg-muted/30 p-8 text-center text-muted-foreground">
            {searchQuery
              ? "No CTA buttons found matching your search"
              : "No CTA buttons found"}
          </div>
        ) : (
          <div className="space-y-2">
            <CardList
              items={filteredCTAButtons}
              renderContent={renderContent}
              renderActions={renderActions}
            />
          </div>
        )}
      </div>
    </div>
  );
}

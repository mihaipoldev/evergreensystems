"use client";

import { useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ActionMenu } from "@/components/admin/ActionMenu";
import { AdminToolbar } from "@/components/admin/AdminToolbar";
import { SortableCardList } from "@/components/admin/SortableCardList";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RichText } from "@/components/ui/RichText";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type { FAQItem } from "../types";

type FAQListProps = {
  initialFAQItems: FAQItem[];
  hideHeader?: boolean;
  sectionId?: string;
  pageId?: string;
};

export function FAQList({ initialFAQItems, hideHeader = false, sectionId, pageId }: FAQListProps) {
  const [faqItems, setFAQItems] = useState<FAQItem[]>(initialFAQItems);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const pathname = usePathname();

  const handleDelete = useCallback(async (id: string) => {
    try {
      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      const response = await fetch(`/api/admin/faq-items/${id}`, {
        method: "DELETE",
        headers: {
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete FAQ item");
      }

      toast.success("FAQ item deleted successfully");
      setFAQItems((prev) => prev.filter((item) => item.id !== id));
    } catch (error: any) {
      console.error("Error deleting FAQ item:", error);
      toast.error(error.message || "Failed to delete FAQ item");
      throw error;
    }
  }, []);


  const handleReorder = useCallback(async (orderedItems: FAQItem[]) => {
    if (searchQuery.trim()) {
      toast.info("Clear the search to reorder FAQs.");
      return;
    }

    setIsSavingOrder(true);
    const newOrder = orderedItems.map((item, index) => ({ ...item, position: index }));

    // Store current state before updating using functional update
    let previousItems: FAQItem[] = [];
    setFAQItems((prev) => {
      previousItems = prev;
      return newOrder;
    });

    try {
      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      const response = await fetch("/api/admin/faq-items/reorder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({
          items: newOrder.map(({ id, position }) => ({ id, position })),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to reorder FAQs");
      }

      toast.success("FAQ order updated");
    } catch (error: any) {
      console.error("Error reordering FAQs:", error);
      toast.error(error.message || "Failed to reorder FAQs");
      setFAQItems(previousItems);
    } finally {
      setIsSavingOrder(false);
    }
  }, [searchQuery]);

  const filteredFAQItems = useMemo(() => {
    return faqItems.filter((item) => {
      const query = searchQuery.toLowerCase();
      return (
        item.question.toLowerCase().includes(query) ||
        item.answer.toLowerCase().includes(query)
      );
    });
  }, [faqItems, searchQuery]);

  const renderContent = useCallback((item: FAQItem) => {
    const editHref = pageId && sectionId 
      ? `/admin/faq/${item.id}/edit?returnTo=/admin/pages/${pageId}/sections/${sectionId}?tab=faq`
      : `/admin/faq/${item.id}/edit`;
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <Link
            href={editHref}
            className="text-base font-semibold text-foreground leading-snug hover:text-primary transition-colors cursor-pointer"
          >
            {item.question}
          </Link>
        </div>
        <RichText
          text={item.answer}
          as="div"
          className="text-sm text-muted-foreground leading-relaxed line-clamp-2 md:line-clamp-3"
        />
      </div>
    );
  }, [pageId, sectionId]);

  const renderActions = useCallback((item: FAQItem) => {
    const editHref = pageId && sectionId 
      ? `/admin/pages/${pageId}/sections/${sectionId}/items/${item.id}/edit`
      : `/admin/faq/${item.id}/edit`;
    return (
      <ActionMenu
        itemId={item.id}
        editHref={editHref}
        onDelete={handleDelete}
        deleteLabel={`FAQ item "${item.question}"`}
      />
    );
  }, [pageId, sectionId, handleDelete]);

  return (
    <div className="w-full">
      {!hideHeader && (
        <div className="mb-6 md:mb-8">
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-3 mb-2">
              <h1 className="text-4xl font-bold text-foreground leading-none">FAQ</h1>
              <span className="inline-flex items-center justify-center h-5 px-2.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 leading-none">
                ({filteredFAQItems.length} {filteredFAQItems.length === 1 ? "item" : "items"})
              </span>
            </div>
            <p className="text-base text-muted-foreground">
              Manage frequently asked questions and their answers.
            </p>
          </div>
        </div>
      )}
      <div className="space-y-3 md:space-y-4">
        <AdminToolbar
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search FAQ..."
        >
          <Button
            asChild
            variant="ghost"
            className="rounded-full w-10 h-10 p-0 bg-transparent text-muted-foreground hover:text-primary hover:bg-transparent border-0 shadow-none transition-colors"
            title="New FAQ Item"
          >
            <Link href={pageId && sectionId ? `/admin/faq/new?returnTo=/admin/pages/${pageId}/sections/${sectionId}?tab=faq` : "/admin/faq/new"}>
              <FontAwesomeIcon icon={faPlus} className="h-5 w-5" />
            </Link>
          </Button>
        </AdminToolbar>

            {filteredFAQItems.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/60 bg-muted/30 p-8 text-center text-muted-foreground">
                  {searchQuery
                    ? "No FAQ items found matching your search"
                    : "No FAQ items found"}
          </div>
            ) : (
          <div className="space-y-2">
            <SortableCardList
              items={filteredFAQItems}
              onReorder={handleReorder}
              renderContent={renderContent}
              renderActions={renderActions}
            />
            {isSavingOrder && (
              <p className="text-xs text-muted-foreground px-1">Saving order...</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { ActionMenu } from "@/components/admin/ActionMenu";
import { AdminToolbar } from "@/components/admin/AdminToolbar";
import { SortableCardList } from "@/components/admin/SortableCardList";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faStar, faStarHalfStroke, faQuoteLeft } from "@fortawesome/free-solid-svg-icons";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { FontAwesomeIconFromClass } from "@/components/admin/FontAwesomeIconFromClass";
import { useDuplicateTestimonial } from "@/lib/react-query/hooks/useTestimonials";
import type { Testimonial } from "../types";

type TestimonialsListProps = {
  initialTestimonials: Testimonial[];
  hideHeader?: boolean;
  sectionId?: string;
  pageId?: string;
};

export function TestimonialsList({ initialTestimonials, hideHeader = false, sectionId, pageId }: TestimonialsListProps) {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(initialTestimonials);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const duplicateTestimonial = useDuplicateTestimonial();

  const handleDuplicate = useCallback(async (id: string) => {
    try {
      await duplicateTestimonial.mutateAsync({ id, sectionId });
      toast.success("Testimonial duplicated successfully");
      // Refresh the list
      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      const response = await fetch(`/api/admin/testimonials`, {
        headers: {
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
      });

      if (response.ok) {
        const updated = await response.json();
        setTestimonials(updated);
      }
    } catch (error: any) {
      console.error("Error duplicating testimonial:", error);
      toast.error(error.message || "Failed to duplicate testimonial");
      throw error;
    }
  }, [sectionId, duplicateTestimonial]);

  const handleDelete = useCallback(async (id: string) => {
    try {
      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      const response = await fetch(`/api/admin/testimonials/${id}`, {
        method: "DELETE",
        headers: {
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete testimonial");
      }

      toast.success("Testimonial deleted successfully");
      setTestimonials((prev) => prev.filter((item) => item.id !== id));
    } catch (error: any) {
      console.error("Error deleting testimonial:", error);
      toast.error(error.message || "Failed to delete testimonial");
      throw error;
    }
  }, []);


  const handleReorder = useCallback(async (orderedItems: Testimonial[]) => {
    if (searchQuery.trim()) {
      toast.info("Clear the search to reorder testimonials.");
      return;
    }

    setIsSavingOrder(true);
    const newOrder = orderedItems.map((item, index) => ({ ...item, position: index }));

    // Store current state before updating using functional update
    let previousItems: Testimonial[] = [];
    setTestimonials((prev) => {
      previousItems = prev;
      return newOrder;
    });

    try {
      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      const response = await fetch("/api/admin/testimonials/reorder", {
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
        throw new Error(error.error || "Failed to reorder testimonials");
      }

      toast.success("Testimonial order updated");
    } catch (error: any) {
      console.error("Error reordering testimonials:", error);
      toast.error(error.message || "Failed to reorder testimonials");
      setTestimonials(previousItems);
    } finally {
      setIsSavingOrder(false);
    }
  }, [searchQuery]);

  const filteredTestimonials = useMemo(() => {
    return testimonials.filter((item) => {
      const query = searchQuery.toLowerCase();
      return (
        item.author_name.toLowerCase().includes(query) ||
        (item.quote && item.quote.toLowerCase().includes(query)) ||
        (item.company_name && item.company_name.toLowerCase().includes(query)) ||
        (item.author_role && item.author_role.toLowerCase().includes(query))
      );
    });
  }, [testimonials, searchQuery]);

  const renderContent = useCallback((item: Testimonial) => (
    <div className="flex items-start gap-3">
      <div className="h-12 w-12 rounded-full overflow-hidden hidden md:flex items-center justify-center shadow-md flex-shrink-0 bg-muted">
        <FontAwesomeIconFromClass
          iconClass={(item as any).icon}
          fallbackIcon={faQuoteLeft}
          className="h-6 w-6 !text-primary"
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3 mb-0.5">
          <Link
            href={pageId && sectionId 
              ? `/admin/testimonials/${item.id}/edit?returnTo=/admin/pages/${pageId}/sections/${sectionId}?tab=testimonials`
              : `/admin/testimonials/${item.id}/edit`}
            className="text-base font-semibold text-foreground leading-snug hover:text-primary transition-colors cursor-pointer"
          >
            {item.author_name}
          </Link>
        </div>
        {(item.author_role || item.company_name) && (
          <p className="text-sm text-muted-foreground mb-3">
            {item.author_role && item.company_name
              ? `${item.author_role} at ${item.company_name}`
              : item.author_role || item.company_name}
          </p>
        )}
        {item.headline && (
          <p className="text-sm font-semibold text-foreground">
            {item.headline}
          </p>
        )}
        {item.quote && (
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 md:line-clamp-3">
            {item.quote}
          </p>
        )}
        {item.rating && (
          <div className="flex gap-0.5 mt-2">
            {[...Array(Math.floor(item.rating))].map((_, i) => (
              <FontAwesomeIcon
                key={`full-${i}`}
                icon={faStar}
                className="w-3.5 h-3.5 text-yellow-400"
              />
            ))}
            {item.rating % 1 >= 0.5 && (
              <FontAwesomeIcon
                key="half"
                icon={faStarHalfStroke}
                className="w-3.5 h-3.5 text-yellow-400"
              />
            )}
            {[...Array(5 - Math.ceil(item.rating))].map((_, i) => (
              <FontAwesomeIcon
                key={`empty-${i}`}
                icon={faStar}
                className="w-3.5 h-3.5 text-yellow-400 opacity-30"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  ), []);

  const renderActions = useCallback((item: Testimonial) => {
    const editHref = pageId && sectionId 
      ? `/admin/testimonials/${item.id}/edit?returnTo=/admin/pages/${pageId}/sections/${sectionId}?tab=testimonials`
      : `/admin/testimonials/${item.id}/edit`;
    return (
    <ActionMenu
      itemId={item.id}
      editHref={editHref}
      onDelete={handleDelete}
      onDuplicate={handleDuplicate}
      deleteLabel={`testimonial from "${item.author_name}"`}
    />
  );
  }, [pageId, sectionId, handleDelete, handleDuplicate]);

  return (
    <div className="w-full">
      {!hideHeader && (
          <div className="mb-6 md:mb-8">
            <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-3 mb-2">
              <h1 className="text-4xl font-bold text-foreground leading-none">Testimonials</h1>
              <span className="inline-flex items-center justify-center h-5 px-2.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 leading-none">
                ({filteredTestimonials.length} {filteredTestimonials.length === 1 ? "testimonial" : "testimonials"})
              </span>
            </div>
            <p className="text-base text-muted-foreground">
              Manage customer testimonials and reviews.
            </p>
          </div>
        </div>
      )}
      <div className="space-y-3 md:space-y-4">
        <AdminToolbar
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search testimonials..."
        >
          <Button
            asChild
            variant="ghost"
            className="rounded-full w-10 h-10 p-0 bg-transparent text-muted-foreground hover:text-primary hover:bg-transparent border-0 shadow-none transition-colors"
            title="New Testimonial"
          >
            <Link href={pageId && sectionId ? `/admin/testimonials/new?returnTo=/admin/pages/${pageId}/sections/${sectionId}?tab=testimonials` : "/admin/testimonials/new"}>
              <FontAwesomeIcon icon={faPlus} className="h-5 w-5" />
            </Link>
          </Button>
        </AdminToolbar>

        {filteredTestimonials.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/60 bg-muted/30 p-8 text-center text-muted-foreground">
            {searchQuery
              ? "No testimonials found matching your search"
              : "No testimonials found"}
          </div>
        ) : (
          <div className="space-y-2">
            <SortableCardList
              items={filteredTestimonials}
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

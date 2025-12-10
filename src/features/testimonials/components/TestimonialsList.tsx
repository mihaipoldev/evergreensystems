"use client";

import { useState } from "react";
import Link from "next/link";
import { ActionMenu } from "@/components/admin/ActionMenu";
import { AdminToolbar } from "@/components/admin/AdminToolbar";
import { SortableCardList } from "@/components/admin/SortableCardList";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faStar, faStarHalfStroke, faCheck, faX, faQuoteLeft } from "@fortawesome/free-solid-svg-icons";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { FontAwesomeIconFromClass } from "@/components/admin/FontAwesomeIconFromClass";
import type { Testimonial } from "../types";

type TestimonialsListProps = {
  initialTestimonials: Testimonial[];
};

export function TestimonialsList({ initialTestimonials }: TestimonialsListProps) {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(initialTestimonials);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSavingOrder, setIsSavingOrder] = useState(false);

  const handleDelete = async (id: string) => {
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
      setTestimonials(testimonials.filter((item) => item.id !== id));
    } catch (error: any) {
      console.error("Error deleting testimonial:", error);
      toast.error(error.message || "Failed to delete testimonial");
      throw error;
    }
  };

  const handleToggleApproval = async (item: Testimonial) => {
    try {
      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      const nextApproved = !item.approved;

      const response = await fetch(`/api/admin/testimonials/${item.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({ approved: nextApproved }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update approval status");
      }

      const updatedTestimonial = await response.json();

      // Update state with the response data to ensure position is preserved
      setTestimonials((items) =>
        items.map((testimonial) =>
          testimonial.id === item.id ? { ...testimonial, ...updatedTestimonial } : testimonial
        )
      );
      toast.success(`Testimonial ${nextApproved ? "approved" : "unapproved"}`);
    } catch (error: any) {
      console.error("Error toggling testimonial approval:", error);
      toast.error(error.message || "Failed to update approval status");
    }
  };

  const handleReorder = async (orderedItems: Testimonial[]) => {
    if (searchQuery.trim()) {
      toast.info("Clear the search to reorder testimonials.");
      return;
    }

    setIsSavingOrder(true);
    const previousItems = testimonials;
    const newOrder = orderedItems.map((item, index) => ({ ...item, position: index }));

    setTestimonials(newOrder);

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
  };

  const filteredTestimonials = testimonials.filter((item) => {
    const query = searchQuery.toLowerCase();
    return (
      item.author_name.toLowerCase().includes(query) ||
      (item.quote && item.quote.toLowerCase().includes(query)) ||
      (item.company_name && item.company_name.toLowerCase().includes(query)) ||
      (item.author_role && item.author_role.toLowerCase().includes(query))
    );
  });

  return (
    <div className="w-full">
      <div className="mb-6 md:mb-8 relative">
        <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-primary/20 via-primary/10 to-transparent rounded-full" />
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
            <Link href="/admin/testimonials/new">
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
              renderContent={(item) => (
                <div className="flex items-start gap-3">
                  <div className="h-12 w-12 rounded-full overflow-hidden flex items-center justify-center shadow-md flex-shrink-0 bg-muted">
                    <FontAwesomeIconFromClass
                      iconClass={(item as any).icon}
                      fallbackIcon={faQuoteLeft}
                      className="h-6 w-6 !text-primary"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-0.5">
                      <Link
                        href={`/admin/testimonials/${item.id}/edit`}
                        className="text-base font-semibold text-foreground leading-snug hover:text-primary transition-colors cursor-pointer"
                      >
                        {item.author_name}
                      </Link>
                      <Badge
                        variant={item.approved ? "default" : "outline"}
                        className="text-xs flex-shrink-0"
                      >
                        {item.approved ? "Approved" : "Unapproved"}
                      </Badge>
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
              )}
              renderActions={(item) => (
                <ActionMenu
                  itemId={item.id}
                  editHref={`/admin/testimonials/${item.id}/edit`}
                  onDelete={handleDelete}
                  deleteLabel={`testimonial from "${item.author_name}"`}
                  customActions={[
                    {
                      label: item.approved ? "Unapprove" : "Approve",
                      icon: (
                        <FontAwesomeIcon
                          icon={item.approved ? faX : faCheck}
                          className="h-4 w-4"
                        />
                      ),
                      onClick: () => handleToggleApproval(item),
                    },
                  ]}
                />
              )}
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

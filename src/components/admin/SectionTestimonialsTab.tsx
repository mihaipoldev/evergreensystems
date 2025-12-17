"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { AdminToolbar } from "@/components/admin/AdminToolbar";
import { SortableCardList } from "@/components/admin/SortableCardList";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faCheck, faX, faQuoteLeft, faStar } from "@fortawesome/free-solid-svg-icons";
import { ActionMenu } from "@/components/admin/ActionMenu";
import { PageSectionStatusSelector } from "@/components/admin/PageSectionStatusSelector";
import { toast } from "sonner";
import { RichText } from "@/components/ui/RichText";
import { useDuplicateTestimonial, useDeleteTestimonial } from "@/lib/react-query/hooks/useTestimonials";
import type { Testimonial, TestimonialWithSection } from "@/features/testimonials/types";

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.toLocaleDateString('en-US', { month: 'long' });
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
};

type SectionTestimonialsTabProps = {
  sectionId: string;
  pageId?: string;
  initialTestimonials: TestimonialWithSection[];
};

export function SectionTestimonialsTab({ sectionId, pageId, initialTestimonials }: SectionTestimonialsTabProps) {
  const [sectionTestimonials, setSectionTestimonials] = useState<TestimonialWithSection[]>(initialTestimonials);
  const [allTestimonials, setAllTestimonials] = useState<Testimonial[]>([]);
  const duplicateTestimonial = useDuplicateTestimonial();
  const deleteTestimonial = useDeleteTestimonial();

  const loadSectionTestimonials = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      const response = await fetch(`/api/admin/sections/${sectionId}/testimonials`, {
        headers: {
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
      });

      if (response.ok) {
        const testimonials = await response.json();
        setSectionTestimonials(testimonials);
      }
    } catch (error) {
      console.error("Error loading section testimonials:", error);
    }
  }, [sectionId]);

  const loadAllTestimonials = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      const response = await fetch("/api/admin/testimonials", {
        headers: {
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
      });

      if (response.ok) {
        const testimonials = await response.json();
        setAllTestimonials(testimonials || []);
      }
    } catch (error) {
      console.error("Error loading all testimonials:", error);
    }
  }, []);

  useEffect(() => {
    loadSectionTestimonials();
    loadAllTestimonials();
  }, [loadSectionTestimonials, loadAllTestimonials]);

  const handleAddTestimonial = async (testimonialId: string) => {
    try {
      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      const maxPosition = sectionTestimonials.length > 0 
        ? Math.max(...sectionTestimonials.map((t) => t.section_testimonial.position))
        : -1;

      const response = await fetch(`/api/admin/sections/${sectionId}/testimonials`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({
          testimonial_id: testimonialId,
          position: maxPosition + 1,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to add testimonial");
      }

      toast.success("Testimonial added successfully");
      await loadSectionTestimonials();
    } catch (error: any) {
      console.error("Error adding testimonial:", error);
      toast.error(error.message || "Failed to add testimonial");
    }
  };

  const handleRemoveTestimonial = async (testimonialId: string): Promise<void> => {
    try {
      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      const testimonial = sectionTestimonials.find((t) => t.id === testimonialId);
      if (!testimonial) return;

      const response = await fetch(
        `/api/admin/sections/${sectionId}/testimonials?section_testimonial_id=${testimonial.section_testimonial.id}`,
        {
          method: "DELETE",
          headers: {
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to remove testimonial");
      }

      setSectionTestimonials(sectionTestimonials.filter((t) => t.id !== testimonialId));
      toast.success("Testimonial removed successfully");
    } catch (error: any) {
      console.error("Error removing testimonial:", error);
      toast.error(error.message || "Failed to remove testimonial");
      throw error;
    }
  };

  const handleDuplicate = useCallback(async (testimonialId: string, isConnected: boolean = false) => {
    try {
      // Only pass sectionId if duplicating from connected section
      await duplicateTestimonial.mutateAsync({ 
        id: testimonialId, 
        sectionId: isConnected ? sectionId : undefined 
      });
      toast.success("Testimonial duplicated successfully");
      await loadSectionTestimonials();
      await loadAllTestimonials();
    } catch (error: any) {
      console.error("Error duplicating testimonial:", error);
      toast.error(error.message || "Failed to duplicate testimonial");
      throw error;
    }
  }, [sectionId, duplicateTestimonial, loadSectionTestimonials, loadAllTestimonials]);

  const handleDeleteTestimonial = useCallback(async (testimonialId: string) => {
    try {
      await deleteTestimonial.mutateAsync(testimonialId);
      toast.success("Testimonial deleted successfully");
      await loadSectionTestimonials();
      await loadAllTestimonials();
    } catch (error: any) {
      console.error("Error deleting testimonial:", error);
      toast.error(error.message || "Failed to delete testimonial");
      throw error;
    }
  }, [deleteTestimonial, loadSectionTestimonials, loadAllTestimonials]);

  const handleReorder = useCallback(async (orderedItems: TestimonialWithSection[]) => {
    const newOrder = orderedItems.map((item, index) => ({ ...item, section_testimonial: { ...item.section_testimonial, position: index } }));

    let previousItems: TestimonialWithSection[] = [];
    setSectionTestimonials((prev) => {
      previousItems = prev;
      return newOrder;
    });

    const toastId = toast.loading("Saving order...");

    try {
      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      const response = await fetch(`/api/admin/sections/${sectionId}/testimonials/reorder`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({
          items: newOrder.map((item, index) => ({
            section_testimonial_id: item.section_testimonial.id,
            position: index,
          })),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to reorder testimonials");
      }

      toast.success("Testimonials reordered successfully", { id: toastId });
    } catch (error: any) {
      console.error("Error reordering testimonials:", error);
      toast.error(error.message || "Failed to reorder testimonials", { id: toastId });
      setSectionTestimonials(previousItems);
    }
  }, [sectionId]);

  const renderStars = (rating: number | null) => {
    if (!rating) return null;
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    return (
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => (
          <FontAwesomeIcon
            key={i}
            icon={faStar}
            className={i < fullStars ? "text-yellow-500" : "text-gray-300"}
            size="xs"
          />
        ))}
      </div>
    );
  };

  const renderContent = useCallback((testimonial: TestimonialWithSection) => {
    return (
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 bg-primary/10">
          <FontAwesomeIcon icon={faQuoteLeft} className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div>
              <h3 className="font-semibold text-sm">
                {testimonial.author_name}
                {testimonial.author_role && (
                  <span className="text-muted-foreground font-normal"> • {testimonial.author_role}</span>
                )}
              </h3>
              {testimonial.rating && (
                <div className="mt-1">{renderStars(testimonial.rating)}</div>
              )}
            </div>
            <PageSectionStatusSelector
              status={testimonial.section_testimonial.status}
              onStatusChange={async (newStatus) => {
                const supabase = createClient();
                const { data: sessionData } = await supabase.auth.getSession();
                const accessToken = sessionData?.session?.access_token;
                
                const response = await fetch(`/api/admin/sections/${sectionId}/testimonials/${testimonial.section_testimonial.id}`, {
                  method: "PATCH",
                  headers: {
                    "Content-Type": "application/json",
                    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
                  },
                  body: JSON.stringify({ status: newStatus }),
                });
                
                if (response.ok) {
                  await loadSectionTestimonials();
                }
              }}
            />
          </div>
          {(testimonial.headline || testimonial.quote) && (
            <div>
              {testimonial.headline && (
                <p className="text-xs font-bold text-foreground mb-1">
                  {testimonial.headline}
                </p>
              )}
              {testimonial.quote && (
                <RichText
                  text={testimonial.quote}
                  as="p"
                  className="text-xs text-muted-foreground line-clamp-2 leading-relaxed"
                />
              )}
            </div>
          )}
        </div>
      </div>
    );
  }, [sectionId]);

  const renderActions = useCallback((testimonial: TestimonialWithSection) => (
    <ActionMenu
      itemId={testimonial.id}
      editHref={`/admin/testimonials/${testimonial.id}/edit?returnTo=/admin/sections/${sectionId}?pageId=${pageId}&tab=testimonials`}
      onDelete={async () => {
        await handleDeleteTestimonial(testimonial.id);
      }}
      onDuplicate={async () => {
        await handleDuplicate(testimonial.id, true); // true = is connected
      }}
      deleteLabel="this testimonial"
      customActions={[
        {
          label: "Deselect",
          icon: <FontAwesomeIcon icon={faX} className="h-4 w-4" />,
          onClick: async () => {
            await handleRemoveTestimonial(testimonial.id);
          },
        },
      ]}
    />
  ), [pageId, sectionId, handleRemoveTestimonial, handleDuplicate, handleDeleteTestimonial]);

  const selectedTestimonialIds = sectionTestimonials.map((t) => t.id);
  const unselectedTestimonials = allTestimonials
    .filter((t) => !selectedTestimonialIds.includes(t.id))
    .sort((a, b) => (a.author_name || "").localeCompare(b.author_name || ""));

  return (
    <div className="w-full space-y-4">
      <AdminToolbar>
        <Button
          asChild
          variant="ghost"
          className="rounded-full w-10 h-10 p-0 bg-transparent text-muted-foreground hover:text-primary hover:bg-transparent border-0 shadow-none transition-colors"
          title="Add Testimonial"
        >
          <Link href={`/admin/testimonials/new?returnTo=/admin/sections/${sectionId}?pageId=${pageId}&tab=testimonials`}>
            <FontAwesomeIcon icon={faPlus} className="h-5 w-5" />
          </Link>
        </Button>
      </AdminToolbar>

      {/* Selected Testimonials */}
      {sectionTestimonials.length > 0 && (
        <div className="space-y-4 mb-6">
          <h3 className="text-lg font-semibold">Connected Testimonials</h3>
          <SortableCardList
            items={sectionTestimonials}
            onReorder={handleReorder}
            renderContent={renderContent}
            renderActions={renderActions}
          />
        </div>
      )}

      {/* Unselected Testimonials */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">
            {sectionTestimonials.length > 0 ? "Other Testimonials" : "Available Testimonials"}
          </h3>
          <p className="text-sm text-muted-foreground">
            Click the action menu to add testimonials to this section
          </p>
        </div>
        {unselectedTestimonials.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground border rounded-lg">
            {sectionTestimonials.length > 0
              ? "No other testimonials available"
              : "No testimonials available. Create one to get started."}
          </div>
        ) : (
          <div className="space-y-4">
            {unselectedTestimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="group relative bg-card border rounded-lg p-4 transition-all hover:border-primary/50 hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 bg-muted">
                    <FontAwesomeIcon icon={faQuoteLeft} className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div>
                        <h3 className="font-semibold text-sm">
                          {testimonial.author_name}
                          {testimonial.author_role && (
                            <span className="text-muted-foreground font-normal"> • {testimonial.author_role}</span>
                          )}
                        </h3>
                        {testimonial.rating && (
                          <div className="mt-1">{renderStars(testimonial.rating)}</div>
                        )}
                      </div>
                      <ActionMenu
                        itemId={testimonial.id}
                        editHref={`/admin/testimonials/${testimonial.id}/edit?returnTo=/admin/sections/${sectionId}?pageId=${pageId}&tab=testimonials`}
                        onDelete={async () => {
                          await handleDeleteTestimonial(testimonial.id);
                        }}
                        onDuplicate={async () => {
                          await handleDuplicate(testimonial.id, false); // false = not connected
                        }}
                        deleteLabel="this testimonial"
                        customActions={[
                          {
                            label: "Select",
                            icon: <FontAwesomeIcon icon={faCheck} className="h-4 w-4" />,
                            onClick: async () => {
                              await handleAddTestimonial(testimonial.id);
                            },
                          },
                        ]}
                      />
                    </div>
                    {(testimonial.headline || testimonial.quote) && (
                      <div className="mb-1">
                        {testimonial.headline && (
                          <p className="text-xs font-bold text-foreground mb-1">
                            {testimonial.headline}
                          </p>
                        )}
                        {testimonial.quote && (
                          <RichText
                            text={testimonial.quote}
                            as="p"
                            className="text-xs text-muted-foreground line-clamp-2 leading-relaxed"
                          />
                        )}
                      </div>
                    )}
                    {testimonial.created_at && (
                      <div className="text-xs text-muted-foreground">
                        {formatDate(testimonial.created_at)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

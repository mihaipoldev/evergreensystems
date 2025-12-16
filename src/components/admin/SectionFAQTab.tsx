"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { AdminToolbar } from "@/components/admin/AdminToolbar";
import { SortableCardList } from "@/components/admin/SortableCardList";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faCheck, faX, faCircleQuestion } from "@fortawesome/free-solid-svg-icons";
import { ActionMenu } from "@/components/admin/ActionMenu";
import { PageSectionStatusSelector } from "@/components/admin/PageSectionStatusSelector";
import { toast } from "sonner";
import { RichText } from "@/components/ui/RichText";
import type { FAQItem, FAQItemWithSection } from "@/features/faq/types";

type SectionFAQTabProps = {
  sectionId: string;
  pageId: string;
  initialFAQItems: FAQItemWithSection[];
};

export function SectionFAQTab({ sectionId, pageId, initialFAQItems }: SectionFAQTabProps) {
  const [sectionFAQItems, setSectionFAQItems] = useState<FAQItemWithSection[]>(initialFAQItems);
  const [allFAQItems, setAllFAQItems] = useState<FAQItem[]>([]);

  useEffect(() => {
    loadSectionFAQItems();
    loadAllFAQItems();
  }, [sectionId]);

  const loadSectionFAQItems = async () => {
    try {
      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      const response = await fetch(`/api/admin/sections/${sectionId}/faq-items`, {
        headers: {
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
      });

      if (response.ok) {
        const faqItems = await response.json();
        setSectionFAQItems(faqItems);
      }
    } catch (error) {
      console.error("Error loading section FAQ items:", error);
    }
  };

  const loadAllFAQItems = async () => {
    try {
      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      const response = await fetch("/api/admin/faq-items", {
        headers: {
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
      });

      if (response.ok) {
        const faqItems = await response.json();
        setAllFAQItems(faqItems || []);
      }
    } catch (error) {
      console.error("Error loading all FAQ items:", error);
    }
  };

  const handleAddFAQItem = async (faqItemId: string) => {
    try {
      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      const maxPosition = sectionFAQItems.length > 0 
        ? Math.max(...sectionFAQItems.map((item) => item.section_faq_item.position))
        : -1;

      const response = await fetch(`/api/admin/sections/${sectionId}/faq-items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({
          faq_item_id: faqItemId,
          position: maxPosition + 1,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to add FAQ item");
      }

      toast.success("FAQ item added successfully");
      await loadSectionFAQItems();
    } catch (error: any) {
      console.error("Error adding FAQ item:", error);
      toast.error(error.message || "Failed to add FAQ item");
    }
  };

  const handleRemoveFAQItem = async (faqItemId: string): Promise<void> => {
    try {
      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      const faqItem = sectionFAQItems.find((item) => item.id === faqItemId);
      if (!faqItem) return;

      const response = await fetch(
        `/api/admin/sections/${sectionId}/faq-items?section_faq_item_id=${faqItem.section_faq_item.id}`,
        {
          method: "DELETE",
          headers: {
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to remove FAQ item");
      }

      setSectionFAQItems(sectionFAQItems.filter((item) => item.id !== faqItemId));
      toast.success("FAQ item removed successfully");
    } catch (error: any) {
      console.error("Error removing FAQ item:", error);
      toast.error(error.message || "Failed to remove FAQ item");
      throw error;
    }
  };

  const handleReorder = useCallback(async (orderedItems: FAQItemWithSection[]) => {
    const newOrder = orderedItems.map((item, index) => ({ ...item, section_faq_item: { ...item.section_faq_item, position: index } }));

    let previousItems: FAQItemWithSection[] = [];
    setSectionFAQItems((prev) => {
      previousItems = prev;
      return newOrder;
    });

    const toastId = toast.loading("Saving order...");

    try {
      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      const response = await fetch(`/api/admin/sections/${sectionId}/faq-items/reorder`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({
          items: newOrder.map((item, index) => ({
            section_faq_item_id: item.section_faq_item.id,
            position: index,
          })),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to reorder FAQ items");
      }

      toast.success("FAQ items reordered successfully", { id: toastId });
    } catch (error: any) {
      console.error("Error reordering FAQ items:", error);
      toast.error(error.message || "Failed to reorder FAQ items", { id: toastId });
      setSectionFAQItems(previousItems);
    }
  }, [sectionId]);

  const renderContent = useCallback((item: FAQItemWithSection) => (
    <div className="flex items-center gap-3">
      <div className="h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 bg-primary/10">
        <FontAwesomeIcon icon={faCircleQuestion} className="h-5 w-5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-2">
          <h3 className="font-semibold text-sm line-clamp-1">
            {item.question}
          </h3>
          <PageSectionStatusSelector
            status={item.section_faq_item.status}
            onStatusChange={async (newStatus) => {
              const supabase = createClient();
              const { data: sessionData } = await supabase.auth.getSession();
              const accessToken = sessionData?.session?.access_token;
              
              const response = await fetch(`/api/admin/sections/${sectionId}/faq-items/${item.section_faq_item.id}`, {
                method: "PATCH",
                headers: {
                  "Content-Type": "application/json",
                  ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
                },
                body: JSON.stringify({ status: newStatus }),
              });
              
              if (response.ok) {
                await loadSectionFAQItems();
              }
            }}
          />
        </div>
        <RichText
          text={item.answer}
          as="p"
          className="text-xs text-muted-foreground line-clamp-2 leading-relaxed"
        />
      </div>
    </div>
  ), []);

  const renderActions = useCallback((item: FAQItemWithSection) => (
    <ActionMenu
      itemId={item.id}
      editHref={`/admin/faq/${item.id}/edit?returnTo=/admin/pages/${pageId}/sections/${sectionId}?tab=faq`}
      onDelete={async () => {
        await handleRemoveFAQItem(item.id);
      }}
      deleteLabel="this FAQ item from the section"
      customActions={[
        {
          label: "Deselect",
          icon: <FontAwesomeIcon icon={faX} className="h-4 w-4" />,
          onClick: async () => {
            await handleRemoveFAQItem(item.id);
          },
        },
      ]}
    />
  ), []);

  const selectedFAQItemIds = sectionFAQItems.map((item) => item.id);
  const unselectedFAQItems = allFAQItems.filter((item) => !selectedFAQItemIds.includes(item.id));

  return (
    <div className="w-full space-y-4">
      <AdminToolbar>
        <Button
          asChild
          variant="ghost"
          className="rounded-full w-10 h-10 p-0 bg-transparent text-muted-foreground hover:text-primary hover:bg-transparent border-0 shadow-none transition-colors"
          title="Add FAQ"
        >
          <Link href={`/admin/faq/new?returnTo=/admin/pages/${pageId}/sections/${sectionId}?tab=faq`}>
            <FontAwesomeIcon icon={faPlus} className="h-5 w-5" />
          </Link>
        </Button>
      </AdminToolbar>

      {/* Selected FAQ Items */}
      {sectionFAQItems.length > 0 && (
        <div className="space-y-4 mb-6">
          <h3 className="text-lg font-semibold">Connected FAQ Items</h3>
          <SortableCardList
            items={sectionFAQItems}
            onReorder={handleReorder}
            renderContent={renderContent}
            renderActions={renderActions}
          />
        </div>
      )}

      {/* Unselected FAQ Items */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">
            {sectionFAQItems.length > 0 ? "Other FAQ Items" : "Available FAQ Items"}
          </h3>
          <p className="text-sm text-muted-foreground">
            Click the action menu to add FAQ items to this section
          </p>
        </div>
        {unselectedFAQItems.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground border rounded-lg">
            {sectionFAQItems.length > 0
              ? "No other FAQ items available"
              : "No FAQ items available. Create one to get started."}
          </div>
        ) : (
          <div className="space-y-4">
            {unselectedFAQItems.map((item) => (
              <div
                key={item.id}
                className="group relative bg-card border rounded-lg p-4 transition-all hover:border-primary/50 hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 bg-muted">
                    <FontAwesomeIcon icon={faCircleQuestion} className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-sm line-clamp-1">
                        {item.question}
                      </h3>
                      <ActionMenu
                        itemId={item.id}
                        editHref={`/admin/faq/${item.id}/edit?returnTo=/admin/pages/${pageId}/sections/${sectionId}?tab=faq`}
                        customActions={[
                          {
                            label: "Select",
                            icon: <FontAwesomeIcon icon={faCheck} className="h-4 w-4" />,
                            onClick: async () => {
                              await handleAddFAQItem(item.id);
                            },
                          },
                        ]}
                      />
                    </div>
                    <RichText
                      text={item.answer}
                      as="p"
                      className="text-xs text-muted-foreground line-clamp-2 leading-relaxed"
                    />
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

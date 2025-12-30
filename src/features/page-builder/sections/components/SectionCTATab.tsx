"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { AdminToolbar } from "@/components/admin/ui/AdminToolbar";
import { SortableCardList } from "@/components/admin/ui/SortableCardList";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faTrash,
  faMousePointer,
  faLink,
  faCheck,
  faX,
} from "@fortawesome/free-solid-svg-icons";
import { IconFromClass } from "@/components/admin/modals/IconFromClass";
import { ActionMenu } from "@/components/admin/ui/ActionMenu";
import { PageSectionStatusSelector } from "@/features/page-builder/pages/components/PageSectionStatusSelector";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useDuplicateCTAButton, useDeleteCTAButton } from "@/features/page-builder/cta/hooks";
import { CTAButtonCard } from "@/features/page-builder/cta/components/CTAButtonCard";
import type { CTAButton, CTAButtonWithSection } from "@/features/page-builder/cta/types";

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.toLocaleDateString('en-US', { month: 'long' });
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
};

type SectionCTATabProps = {
  sectionId: string;
  pageId?: string;
  initialCTAButtons: CTAButtonWithSection[];
};

export function SectionCTATab({ sectionId, pageId, initialCTAButtons }: SectionCTATabProps) {
  const [sectionCTAButtons, setSectionCTAButtons] = useState<CTAButtonWithSection[]>(initialCTAButtons || []);
  const [allCTAButtons, setAllCTAButtons] = useState<CTAButton[]>([]);
  const duplicateCTAButton = useDuplicateCTAButton();
  const deleteCTAButton = useDeleteCTAButton();

  const loadSectionCTAs = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      const response = await fetch(`/api/admin/sections/${sectionId}/cta-buttons`, {
        headers: {
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
      });

      if (response.ok) {
        const ctaButtons = await response.json();
        // Filter out any invalid items and ensure they have required fields
        const validButtons = (ctaButtons || []).filter((btn: any) => {
          // Check if button has required fields
          if (!btn || !btn.id) {
            return false;
          }
          // Check if section_cta_button exists (required for CTAButtonWithSection type)
          if (!btn.section_cta_button || !btn.section_cta_button.id) {
            return false;
          }
          return true;
        });
        setSectionCTAButtons(validButtons);
      } else {
        const errorText = await response.text();
        console.error("Failed to load section CTA buttons:", response.status, errorText);
      }
    } catch (error) {
      console.error("Error loading section CTA buttons:", error);
    }
  }, [sectionId]);

  const loadAllCTAButtons = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      const response = await fetch("/api/admin/cta-buttons", {
        headers: {
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
      });

      if (response.ok) {
        const ctaButtons = await response.json();
        // Filter out any invalid items and ensure they have required fields
        const validButtons = (ctaButtons || []).filter((btn: any) => {
          if (!btn || !btn.id) {
            return false;
          }
          return true;
        });
        setAllCTAButtons(validButtons);
      } else {
        const errorText = await response.text();
        console.error("Failed to load all CTA buttons:", response.status, errorText);
      }
    } catch (error) {
      console.error("Error loading all CTA buttons:", error);
    }
  }, []);

  useEffect(() => {
    loadSectionCTAs();
    loadAllCTAButtons();
  }, [loadSectionCTAs, loadAllCTAButtons]);

  const handleAddCTA = useCallback(async (ctaButtonId: string) => {
    try {
      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      const maxPosition = sectionCTAButtons.length > 0 
        ? Math.max(...sectionCTAButtons.map((c) => c.section_cta_button.position))
        : -1;

      const response = await fetch(`/api/admin/sections/${sectionId}/cta-buttons`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({
          cta_button_id: ctaButtonId,
          position: maxPosition + 1,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to add CTA button");
      }

      toast.success("CTA button added successfully");
      await loadSectionCTAs();
    } catch (error: any) {
      console.error("Error adding CTA button:", error);
      toast.error(error.message || "Failed to add CTA button");
    }
  }, [sectionId, sectionCTAButtons, loadSectionCTAs]);

  const handleRemoveCTA = useCallback(async (ctaButtonId: string): Promise<void> => {
    try {
      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      const ctaButtonItem = sectionCTAButtons.find((c) => c.id === ctaButtonId);
      if (!ctaButtonItem) return;

      const response = await fetch(
        `/api/admin/sections/${sectionId}/cta-buttons?section_cta_button_id=${ctaButtonItem.section_cta_button.id}`,
        {
          method: "DELETE",
          headers: {
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to remove CTA button");
      }

      setSectionCTAButtons((prev) => prev.filter((c) => c.id !== ctaButtonId));
      toast.success("CTA button removed successfully");
    } catch (error: any) {
      console.error("Error removing CTA button:", error);
      toast.error(error.message || "Failed to remove CTA button");
      throw error; // Re-throw so ActionMenu can handle it
    }
  }, [sectionId, sectionCTAButtons]);

  const handleDuplicate = useCallback(async (ctaButtonId: string, isConnected: boolean = false) => {
    try {
      // Only pass sectionId if duplicating from connected section
      await duplicateCTAButton.mutateAsync({ 
        id: ctaButtonId, 
        sectionId: isConnected ? sectionId : undefined 
      });
      toast.success("CTA button duplicated successfully");
      await loadSectionCTAs();
      await loadAllCTAButtons();
    } catch (error: any) {
      console.error("Error duplicating CTA button:", error);
      toast.error(error.message || "Failed to duplicate CTA button");
      throw error;
    }
  }, [sectionId, duplicateCTAButton, loadSectionCTAs, loadAllCTAButtons]);

  const handleDeleteCTA = useCallback(async (ctaButtonId: string) => {
    try {
      await deleteCTAButton.mutateAsync(ctaButtonId);
      toast.success("CTA button deleted successfully");
      await loadSectionCTAs();
      await loadAllCTAButtons();
    } catch (error: any) {
      console.error("Error deleting CTA button:", error);
      toast.error(error.message || "Failed to delete CTA button");
      throw error;
    }
  }, [deleteCTAButton, loadSectionCTAs, loadAllCTAButtons]);

  const handleReorder = useCallback(async (orderedItems: CTAButtonWithSection[]) => {
    const newOrder = orderedItems.map((item, index) => ({ ...item, section_cta_button: { ...item.section_cta_button, position: index } }));

    let previousItems: CTAButtonWithSection[] = [];
    setSectionCTAButtons((prev) => {
      previousItems = prev;
      return newOrder;
    });

    const toastId = toast.loading("Saving order...");

    try {
      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      const response = await fetch(`/api/admin/sections/${sectionId}/cta-buttons/reorder`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({
          items: newOrder.map((item, index) => ({
            section_cta_button_id: item.section_cta_button.id,
            position: index,
          })),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to reorder CTA buttons");
      }

      toast.success("CTA buttons reordered successfully", { id: toastId });
    } catch (error: any) {
      console.error("Error reordering CTA buttons:", error);
      toast.error(error.message || "Failed to reorder CTA buttons", { id: toastId });
      setSectionCTAButtons(previousItems);
    }
  }, [sectionId]);

  const renderContent = useCallback((item: CTAButtonWithSection) => {
    return (
      <CTAButtonCard
        item={item}
        showIcon={true}
        showStatus={true}
        onStatusChange={async (newStatus) => {
          const supabase = createClient();
          const { data: sessionData } = await supabase.auth.getSession();
          const accessToken = sessionData?.session?.access_token;
          
          const response = await fetch(`/api/admin/sections/${sectionId}/cta-buttons/${item.section_cta_button.id}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
            },
            body: JSON.stringify({ status: newStatus }),
          });
          
          if (response.ok) {
            await loadSectionCTAs();
          }
        }}
        variant="compact"
      />
    );
  }, [sectionId, loadSectionCTAs]);

  const renderActions = useCallback((item: CTAButtonWithSection) => (
    <ActionMenu
      itemId={item.id}
      editHref={`/admin/cta/${item.id}/edit?returnTo=/admin/sections/${sectionId}?pageId=${pageId}&tab=cta`}
      onDelete={async () => {
        await handleDeleteCTA(item.id);
      }}
      onDuplicate={async () => {
        await handleDuplicate(item.id, true); // true = is connected
      }}
      deleteLabel="this CTA button"
      customActions={[
        {
          label: "Deselect",
          icon: <FontAwesomeIcon icon={faX} className="h-4 w-4" />,
          onClick: async () => {
            await handleRemoveCTA(item.id);
          },
        },
      ]}
    />
  ), [pageId, sectionId, handleRemoveCTA, handleDuplicate, handleDeleteCTA]);

  const selectedCTAIds = sectionCTAButtons.map((c) => c.id);
  const unselectedCTAs = allCTAButtons
    .filter((c) => !selectedCTAIds.includes(c.id))
    .sort((a, b) => (a.label || "").localeCompare(b.label || ""));

  return (
    <div className="w-full space-y-4">
      <AdminToolbar>
        <Button
          asChild
          variant="ghost"
          className="rounded-full w-10 h-10 p-0 bg-transparent text-muted-foreground hover:text-primary hover:bg-transparent border-0 shadow-none transition-colors"
          title="Add CTA"
        >
          <Link href={`/admin/cta/new?returnTo=/admin/sections/${sectionId}?pageId=${pageId}&tab=cta`}>
            <FontAwesomeIcon icon={faPlus} className="h-5 w-5" />
          </Link>
        </Button>
      </AdminToolbar>

      {/* Selected CTA Buttons */}
      {sectionCTAButtons.length > 0 && (
        <div className="space-y-4 mb-6">
          <h3 className="text-lg font-semibold">Connected CTA Buttons</h3>
          <SortableCardList
            items={sectionCTAButtons}
            onReorder={handleReorder}
            renderContent={renderContent}
            renderActions={renderActions}
          />
        </div>
      )}

      {/* Unselected CTA Buttons Section */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">
            {sectionCTAButtons.length > 0 ? "Other CTA Buttons" : "Available CTA Buttons"}
          </h3>
          <p className="text-sm text-muted-foreground">
            Use the action menu (three dots) to select or deselect CTA buttons
          </p>
        </div>
        {unselectedCTAs.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground border rounded-lg">
            {sectionCTAButtons.length > 0
              ? "No other CTA buttons available"
              : "No CTA buttons available. Create one to get started."}
          </div>
        ) : (
          <div className="space-y-4">
            {unselectedCTAs.map((item) => (
              <div
                key={item.id}
                className={cn(
                  "group relative bg-card border rounded-lg p-4 py-2 transition-all hover:border-primary/50 hover:shadow-md"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 bg-muted">
                    <IconFromClass
                      iconClass={item.icon}
                      fallbackIcon={faMousePointer}
                      className="h-5 w-5 text-muted-foreground"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-semibold text-sm line-clamp-1">
                        {item.label}
                      </h3>
                      <ActionMenu
                        itemId={item.id}
                        editHref={`/admin/cta/${item.id}/edit?returnTo=/admin/sections/${sectionId}?pageId=${pageId}&tab=cta`}
                        onDelete={async () => {
                          await handleDeleteCTA(item.id);
                        }}
                        onDuplicate={async () => {
                          await handleDuplicate(item.id, false); // false = not connected
                        }}
                        deleteLabel="this CTA button"
                        customActions={[
                          {
                            label: "Select",
                            icon: <FontAwesomeIcon icon={faCheck} className="h-4 w-4" />,
                            onClick: async () => {
                              await handleAddCTA(item.id);
                            },
                          },
                        ]}
                      />
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                      <FontAwesomeIcon icon={faLink} className="h-3 w-3" />
                      <span className="truncate">{item.url}</span>
                    </div>
                    {item.created_at && (
                      <div className="text-xs text-muted-foreground">
                        {formatDate(item.created_at)}
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

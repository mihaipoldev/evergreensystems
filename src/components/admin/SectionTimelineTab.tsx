"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { AdminToolbar } from "@/components/admin/AdminToolbar";
import { SortableCardList } from "@/components/admin/SortableCardList";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faCheck, faX, faListOl } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIconFromClass } from "@/components/admin/FontAwesomeIconFromClass";
import { ActionMenu } from "@/components/admin/ActionMenu";
import { PageSectionStatusSelector } from "@/components/admin/PageSectionStatusSelector";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { Timeline, TimelineWithSection } from "@/features/timeline/types";

type SectionTimelineTabProps = {
  sectionId: string;
  pageId: string;
  initialTimelineItems: TimelineWithSection[];
};

export function SectionTimelineTab({ sectionId, pageId, initialTimelineItems }: SectionTimelineTabProps) {
  const [sectionTimelineItems, setSectionTimelineItems] = useState<TimelineWithSection[]>(initialTimelineItems);
  const [allTimelineItems, setAllTimelineItems] = useState<Timeline[]>([]);

  useEffect(() => {
    loadSectionTimelineItems();
    loadAllTimelineItems();
  }, [sectionId]);

  const loadSectionTimelineItems = async () => {
    try {
      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      const response = await fetch(`/api/admin/sections/${sectionId}/timeline`, {
        headers: {
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
      });

      if (response.ok) {
        const timelineItems = await response.json();
        setSectionTimelineItems(timelineItems);
      }
    } catch (error) {
      console.error("Error loading section timeline items:", error);
    }
  };

  const loadAllTimelineItems = async () => {
    try {
      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      const response = await fetch("/api/admin/timeline", {
        headers: {
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
      });

      if (response.ok) {
        const timelineItems = await response.json();
        setAllTimelineItems(timelineItems || []);
      }
    } catch (error) {
      console.error("Error loading all timeline items:", error);
    }
  };

  const handleAddTimeline = async (timelineId: string) => {
    try {
      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      const maxPosition = sectionTimelineItems.length > 0 
        ? Math.max(...sectionTimelineItems.map((item) => item.section_timeline.position))
        : -1;

      const response = await fetch(`/api/admin/sections/${sectionId}/timeline`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({
          timeline_id: timelineId,
          position: maxPosition + 1,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to add timeline item");
      }

      toast.success("Timeline item added successfully");
      await loadSectionTimelineItems();
    } catch (error: any) {
      console.error("Error adding timeline item:", error);
      toast.error(error.message || "Failed to add timeline item");
    }
  };

  const handleRemoveTimeline = async (timelineId: string): Promise<void> => {
    try {
      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      const timelineItem = sectionTimelineItems.find((item) => item.id === timelineId);
      if (!timelineItem) return;

      const response = await fetch(
        `/api/admin/sections/${sectionId}/timeline?section_timeline_id=${timelineItem.section_timeline.id}`,
        {
          method: "DELETE",
          headers: {
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to remove timeline item");
      }

      setSectionTimelineItems(sectionTimelineItems.filter((item) => item.id !== timelineId));
      toast.success("Timeline item removed successfully");
    } catch (error: any) {
      console.error("Error removing timeline item:", error);
      toast.error(error.message || "Failed to remove timeline item");
      throw error;
    }
  };

  const handleReorder = useCallback(async (orderedItems: TimelineWithSection[]) => {
    const newOrder = orderedItems.map((item, index) => ({ ...item, section_timeline: { ...item.section_timeline, position: index } }));

    let previousItems: TimelineWithSection[] = [];
    setSectionTimelineItems((prev) => {
      previousItems = prev;
      return newOrder;
    });

    const toastId = toast.loading("Saving order...");

    try {
      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      const response = await fetch(`/api/admin/sections/${sectionId}/timeline/reorder`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({
          items: newOrder.map((item, index) => ({
            section_timeline_id: item.section_timeline.id,
            position: index,
          })),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to reorder timeline items");
      }

      toast.success("Timeline items reordered successfully", { id: toastId });
    } catch (error: any) {
      console.error("Error reordering timeline items:", error);
      toast.error(error.message || "Failed to reorder timeline items", { id: toastId });
      setSectionTimelineItems(previousItems);
    }
  }, [sectionId]);

  const renderContent = useCallback((item: TimelineWithSection) => (
    <div className="flex items-start gap-3">
      <div className="h-10 w-10 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 bg-primary/10">
        <FontAwesomeIconFromClass
          iconClass={item.icon}
          fallbackIcon={faListOl}
          className="h-5 w-5 text-primary"
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              Step {item.step}
            </Badge>
            {item.badge && (
              <Badge className="text-xs">
                {item.badge}
              </Badge>
            )}
          </div>
          <PageSectionStatusSelector
            status={item.section_timeline.status}
            onStatusChange={async (newStatus) => {
              const supabase = createClient();
              const { data: sessionData } = await supabase.auth.getSession();
              const accessToken = sessionData?.session?.access_token;
              
              const response = await fetch(`/api/admin/sections/${sectionId}/timeline/${item.section_timeline.id}`, {
                method: "PATCH",
                headers: {
                  "Content-Type": "application/json",
                  ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
                },
                body: JSON.stringify({ status: newStatus }),
              });
              
              if (response.ok) {
                await loadSectionTimelineItems();
              }
            }}
          />
        </div>
        <h3 className="font-semibold text-sm mb-1">
          {item.title}
        </h3>
        {item.subtitle && (
          <p className="text-xs text-muted-foreground">
            {item.subtitle}
          </p>
        )}
      </div>
    </div>
  ), [sectionId, loadSectionTimelineItems]);

  const renderActions = useCallback((item: TimelineWithSection) => (
    <ActionMenu
      itemId={item.id}
      editHref={`/admin/timeline/${item.id}/edit?returnTo=/admin/pages/${pageId}/sections/${sectionId}?tab=timeline`}
      onDelete={async () => {
        await handleRemoveTimeline(item.id);
      }}
      deleteLabel="this timeline item from the section"
      customActions={[
        {
          label: "Deselect",
          icon: <FontAwesomeIcon icon={faX} className="h-4 w-4" />,
          onClick: async () => {
            await handleRemoveTimeline(item.id);
          },
        },
      ]}
    />
  ), []);

  const selectedTimelineIds = sectionTimelineItems.map((item) => item.id);
  const unselectedTimelineItems = allTimelineItems.filter((item) => !selectedTimelineIds.includes(item.id));

  return (
    <div className="w-full space-y-4">
      <AdminToolbar>
        <Button
          asChild
          variant="ghost"
          className="rounded-full w-10 h-10 p-0 bg-transparent text-muted-foreground hover:text-primary hover:bg-transparent border-0 shadow-none transition-colors"
          title="Add Timeline"
        >
          <Link href={`/admin/timeline/new?returnTo=/admin/pages/${pageId}/sections/${sectionId}?tab=timeline`}>
            <FontAwesomeIcon icon={faPlus} className="h-5 w-5" />
          </Link>
        </Button>
      </AdminToolbar>

      {/* Selected Timeline Items */}
      {sectionTimelineItems.length > 0 && (
        <div className="space-y-4 mb-6">
          <h3 className="text-lg font-semibold">Connected Timeline Items</h3>
          <SortableCardList
            items={sectionTimelineItems}
            onReorder={handleReorder}
            renderContent={renderContent}
            renderActions={renderActions}
          />
        </div>
      )}

      {/* Unselected Timeline Items */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">
            {sectionTimelineItems.length > 0 ? "Other Timeline Items" : "Available Timeline Items"}
          </h3>
          <p className="text-sm text-muted-foreground">
            Click the action menu to add timeline items to this section
          </p>
        </div>
        {unselectedTimelineItems.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground border rounded-lg">
            {sectionTimelineItems.length > 0
              ? "No other timeline items available"
              : "No timeline items available. Create one to get started."}
          </div>
        ) : (
          <div className="space-y-4">
            {unselectedTimelineItems.map((item) => (
              <div
                key={item.id}
                className="group relative bg-card border rounded-lg p-4 transition-all hover:border-primary/50 hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 bg-muted">
                    <FontAwesomeIconFromClass
                      iconClass={item.icon}
                      fallbackIcon={faListOl}
                      className="h-5 w-5 text-muted-foreground"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">
                        Step {item.step}
                      </Badge>
                      {item.badge && (
                        <Badge variant="secondary" className="text-xs">{item.badge}</Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-semibold text-sm line-clamp-1">
                        {item.title}
                      </h3>
                      <ActionMenu
                        itemId={item.id}
                        editHref={`/admin/timeline/${item.id}/edit?returnTo=/admin/pages/${pageId}/sections/${sectionId}?tab=timeline`}
                        customActions={[
                          {
                            label: "Select",
                            icon: <FontAwesomeIcon icon={faCheck} className="h-4 w-4" />,
                            onClick: async () => {
                              await handleAddTimeline(item.id);
                            },
                          },
                        ]}
                      />
                    </div>
                    {item.subtitle && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {item.subtitle}
                      </p>
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

"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { AdminToolbar } from "@/components/admin/AdminToolbar";
import { SortableCardList } from "@/components/admin/SortableCardList";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faCheck, faX, faShareAlt } from "@fortawesome/free-solid-svg-icons";
import { ActionMenu } from "@/components/admin/ActionMenu";
import { PageSectionStatusSelector } from "@/components/admin/PageSectionStatusSelector";
import { toast } from "sonner";
import type { SocialPlatform, SocialPlatformWithSection } from "@/features/social-platforms/types";

type SectionSocialPlatformsTabProps = {
  sectionId: string;
  pageId: string;
  initialSocialPlatforms: SocialPlatformWithSection[];
};

export function SectionSocialPlatformsTab({ sectionId, pageId, initialSocialPlatforms }: SectionSocialPlatformsTabProps) {
  const [sectionSocialPlatforms, setSectionSocialPlatforms] = useState<SocialPlatformWithSection[]>(initialSocialPlatforms);
  const [allSocialPlatforms, setAllSocialPlatforms] = useState<SocialPlatform[]>([]);

  useEffect(() => {
    loadSectionSocialPlatforms();
    loadAllSocialPlatforms();
  }, [sectionId]);

  const loadSectionSocialPlatforms = async () => {
    try {
      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      const response = await fetch(`/api/admin/sections/${sectionId}/social-platforms`, {
        headers: {
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
      });

      if (response.ok) {
        const platforms = await response.json();
        setSectionSocialPlatforms(platforms);
      }
    } catch (error) {
      console.error("Error loading section social platforms:", error);
    }
  };

  const loadAllSocialPlatforms = async () => {
    try {
      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      const response = await fetch("/api/admin/social-platforms", {
        headers: {
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
      });

      if (response.ok) {
        const platforms = await response.json();
        setAllSocialPlatforms(platforms || []);
      }
    } catch (error) {
      console.error("Error loading all social platforms:", error);
    }
  };

  const handleAddSocialPlatform = async (platformId: string) => {
    try {
      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      const maxOrder = sectionSocialPlatforms.length > 0 
        ? Math.max(...sectionSocialPlatforms.map((p) => p.section_social.order))
        : -1;

      const response = await fetch(`/api/admin/sections/${sectionId}/social-platforms`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({
          platform_id: platformId,
          order: maxOrder + 1,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to add social platform");
      }

      toast.success("Social platform added successfully");
      await loadSectionSocialPlatforms();
    } catch (error: any) {
      console.error("Error adding social platform:", error);
      toast.error(error.message || "Failed to add social platform");
    }
  };

  const handleRemoveSocialPlatform = async (platformId: string): Promise<void> => {
    try {
      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      const platform = sectionSocialPlatforms.find((p) => p.id === platformId);
      if (!platform) return;

      const response = await fetch(
        `/api/admin/sections/${sectionId}/social-platforms?section_social_id=${platform.section_social.id}`,
        {
          method: "DELETE",
          headers: {
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to remove social platform");
      }

      setSectionSocialPlatforms(sectionSocialPlatforms.filter((p) => p.id !== platformId));
      toast.success("Social platform removed successfully");
    } catch (error: any) {
      console.error("Error removing social platform:", error);
      toast.error(error.message || "Failed to remove social platform");
      throw error;
    }
  };

  const handleUpdateStatus = useCallback(async (platform: SocialPlatformWithSection, newStatus: "published" | "draft" | "deactivated") => {
    try {
      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      const response = await fetch(`/api/admin/sections/${sectionId}/social-platforms`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({
          section_social_id: platform.section_social.id,
          status: newStatus,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update status");
      }

      await loadSectionSocialPlatforms();
    } catch (error: any) {
      console.error("Error updating status:", error);
      toast.error(error.message || "Failed to update status");
    }
  }, [sectionId]);

  const handleReorder = useCallback(async (orderedItems: SocialPlatformWithSection[]) => {
    const newOrder = orderedItems.map((item, index) => ({ ...item, section_social: { ...item.section_social, order: index } }));

    let previousItems: SocialPlatformWithSection[] = [];
    setSectionSocialPlatforms((prev) => {
      previousItems = prev;
      return newOrder;
    });

    const toastId = toast.loading("Saving order...");

    try {
      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      const response = await fetch(`/api/admin/sections/${sectionId}/social-platforms/reorder`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({
          items: newOrder.map((item, index) => ({
            section_social_id: item.section_social.id,
            order: index,
          })),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to reorder social platforms");
      }

      toast.success("Social platforms reordered successfully", { id: toastId });
    } catch (error: any) {
      console.error("Error reordering social platforms:", error);
      toast.error(error.message || "Failed to reorder social platforms", { id: toastId });
      setSectionSocialPlatforms(previousItems);
    }
  }, [sectionId]);

  const renderContent = useCallback((platform: SocialPlatformWithSection) => {
    return (
      <div className="flex items-center gap-3">
        {platform.icon ? (
          <div className="h-10 w-10 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 bg-primary/10">
            <img
              src={platform.icon}
              alt={platform.name}
              className="h-8 w-8 object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
                const fallback = document.createElement("div");
                fallback.className = "h-5 w-5 text-primary";
                fallback.innerHTML = `<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2L3 7v11h4v-6h6v6h4V7l-7-5z"/></svg>`;
                target.parentElement?.appendChild(fallback);
              }}
            />
          </div>
        ) : (
          <div className="h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 bg-primary/10">
            <FontAwesomeIcon
              icon={faShareAlt}
              className="h-5 w-5 text-primary"
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-2">
            <h3 className="font-semibold text-sm line-clamp-1">
              {platform.name}
            </h3>
            <PageSectionStatusSelector
              status={platform.section_social.status}
              onStatusChange={(newStatus) => handleUpdateStatus(platform, newStatus)}
            />
          </div>
          <p className="text-xs text-muted-foreground truncate">
            {platform.base_url}
          </p>
        </div>
      </div>
    );
  }, [handleUpdateStatus]);

  const renderActions = useCallback((platform: SocialPlatformWithSection) => (
    <ActionMenu
      itemId={platform.id}
      editHref={`/admin/social-platforms/${platform.id}/edit?returnTo=/admin/pages/${pageId}/sections/${sectionId}?tab=social-platforms`}
      onDelete={async () => {
        await handleRemoveSocialPlatform(platform.id);
      }}
      deleteLabel="this social platform from the section"
      customActions={[
        {
          label: "Deselect",
          icon: <FontAwesomeIcon icon={faX} className="h-4 w-4" />,
          onClick: async () => {
            await handleRemoveSocialPlatform(platform.id);
          },
        },
      ]}
    />
  ), [pageId, sectionId]);

  const selectedPlatformIds = sectionSocialPlatforms.map((p) => p.id);
  const unselectedPlatforms = allSocialPlatforms.filter((p) => !selectedPlatformIds.includes(p.id));

  return (
    <div className="w-full space-y-4">
      <AdminToolbar>
        <Button
          asChild
          variant="ghost"
          className="rounded-full w-10 h-10 p-0 bg-transparent text-muted-foreground hover:text-primary hover:bg-transparent border-0 shadow-none transition-colors"
          title="Add Social Platform"
        >
          <Link href={`/admin/social-platforms/new?returnTo=/admin/pages/${pageId}/sections/${sectionId}?tab=social-platforms`}>
            <FontAwesomeIcon icon={faPlus} className="h-5 w-5" />
          </Link>
        </Button>
      </AdminToolbar>

      {/* Selected Social Platforms */}
      {sectionSocialPlatforms.length > 0 && (
        <div className="space-y-4 mb-6">
          <h3 className="text-lg font-semibold">Connected Social Platforms</h3>
          <SortableCardList
            items={sectionSocialPlatforms}
            onReorder={handleReorder}
            renderContent={renderContent}
            renderActions={renderActions}
          />
        </div>
      )}

      {/* Unselected Social Platforms */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">
            {sectionSocialPlatforms.length > 0 ? "Other Social Platforms" : "Available Social Platforms"}
          </h3>
          <p className="text-sm text-muted-foreground">
            Click the action menu to add social platforms to this section
          </p>
        </div>
        {unselectedPlatforms.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground border rounded-lg">
            {sectionSocialPlatforms.length > 0
              ? "No other social platforms available"
              : "No social platforms available. Create one to get started."}
          </div>
        ) : (
          <div className="space-y-4">
            {unselectedPlatforms.map((platform) => (
              <div
                key={platform.id}
                className="group relative bg-card border rounded-lg p-4 transition-all hover:border-primary/50 hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  {platform.icon ? (
                    <div className="h-10 w-10 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 bg-muted">
                      <img
                        src={platform.icon}
                        alt={platform.name}
                        className="h-8 w-8 object-contain"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = "none";
                          const fallback = document.createElement("div");
                          fallback.className = "h-5 w-5 text-muted-foreground";
                          fallback.innerHTML = `<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2L3 7v11h4v-6h6v6h4V7l-7-5z"/></svg>`;
                          target.parentElement?.appendChild(fallback);
                        }}
                      />
                    </div>
                  ) : (
                    <div className="h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 bg-muted">
                      <FontAwesomeIcon
                        icon={faShareAlt}
                        className="h-5 w-5 text-muted-foreground"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-sm line-clamp-1">
                        {platform.name}
                      </h3>
                      <ActionMenu
                        itemId={platform.id}
                        editHref={`/admin/social-platforms/${platform.id}/edit?returnTo=/admin/pages/${pageId}/sections/${sectionId}?tab=social-platforms`}
                        customActions={[
                          {
                            label: "Select",
                            icon: <FontAwesomeIcon icon={faCheck} className="h-4 w-4" />,
                            onClick: async () => {
                              await handleAddSocialPlatform(platform.id);
                            },
                          },
                        ]}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {platform.base_url}
                    </p>
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

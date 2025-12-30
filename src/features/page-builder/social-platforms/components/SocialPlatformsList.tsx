"use client";

import { useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { ActionMenu } from "@/components/admin/ui/ActionMenu";
import { AdminToolbar } from "@/components/admin/ui/AdminToolbar";
import { CardListContainer } from "@/components/admin/ui/CardListContainer";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faShareAlt } from "@fortawesome/free-solid-svg-icons";
import { IconFromClass } from "@/components/admin/modals/IconFromClass";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useDuplicateSocialPlatform } from "../hooks";
import type { SocialPlatform } from "../types";

type SocialPlatformsListProps = {
  initialSocialPlatforms: SocialPlatform[];
};

export function SocialPlatformsList({ initialSocialPlatforms }: SocialPlatformsListProps) {
  const [socialPlatforms, setSocialPlatforms] = useState<SocialPlatform[]>(initialSocialPlatforms);
  const [searchQuery, setSearchQuery] = useState("");
  const duplicateSocialPlatform = useDuplicateSocialPlatform();

  const handleDuplicate = useCallback(async (id: string) => {
    try {
      await duplicateSocialPlatform.mutateAsync({ id });
      toast.success("Social platform duplicated successfully");
      // Refresh the list
      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      const response = await fetch(`/api/admin/social-platforms`, {
        headers: {
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
      });

      if (response.ok) {
        const updated = await response.json();
        setSocialPlatforms(updated);
      }
    } catch (error: any) {
      console.error("Error duplicating social platform:", error);
      toast.error(error.message || "Failed to duplicate social platform");
      throw error;
    }
  }, [duplicateSocialPlatform]);

  const handleDelete = useCallback(async (id: string) => {
    try {
      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      const response = await fetch(`/api/admin/social-platforms/${id}`, {
        method: "DELETE",
        headers: {
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete social platform");
      }

      toast.success("Social platform deleted successfully");
      setSocialPlatforms((prev) => prev.filter((item) => item.id !== id));
    } catch (error: any) {
      console.error("Error deleting social platform:", error);
      toast.error(error.message || "Failed to delete social platform");
      throw error;
    }
  }, []);

  const filteredSocialPlatforms = useMemo(() => {
    return socialPlatforms.filter((item) => {
      const query = searchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(query) ||
        item.base_url.toLowerCase().includes(query) ||
        (item.icon && item.icon.toLowerCase().includes(query))
      );
    });
  }, [socialPlatforms, searchQuery]);

  const renderContent = useCallback((platform: SocialPlatform) => {
    return (
      <div className="flex items-center gap-3">
        {platform.icon ? (
          <div className="h-12 w-12 rounded-full overflow-hidden flex items-center justify-center shadow-md flex-shrink-0 bg-muted">
            <img
              src={platform.icon}
              alt={platform.name}
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
              icon={faShareAlt}
              className="h-6 w-6 text-primary"
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <Link
            href={`/admin/social-platforms/${platform.id}/edit`}
            className="text-base font-semibold text-foreground leading-snug hover:text-primary transition-colors cursor-pointer"
          >
            {platform.name}
          </Link>
          <p className="text-sm text-muted-foreground mt-0.5 truncate">
            {platform.base_url}
          </p>
        </div>
      </div>
    );
  }, []);

  const renderActions = useCallback((platform: SocialPlatform) => {
    return (
      <ActionMenu
        itemId={platform.id}
        editHref={`/admin/social-platforms/${platform.id}/edit`}
        onDelete={handleDelete}
        onDuplicate={handleDuplicate}
        deleteLabel={`Social platform "${platform.name}"`}
      />
    );
  }, [handleDelete, handleDuplicate]);

  return (
    <div className="w-full">
      <div className="mb-6 md:mb-8">
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-3 mb-2">
            <h1 className="text-4xl font-bold text-foreground leading-none">Social Platforms</h1>
            <span className="inline-flex items-center justify-center h-5 px-2.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 leading-none">
              ({filteredSocialPlatforms.length} {filteredSocialPlatforms.length === 1 ? "platform" : "platforms"})
            </span>
          </div>
          <p className="text-base text-muted-foreground">
            Manage social media platforms and their base URLs.
          </p>
        </div>
      </div>
      <div className="space-y-3 md:space-y-4">
        <AdminToolbar
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search platforms..."
        >
          <Button
            asChild
            variant="ghost"
            className="rounded-full w-10 h-10 p-0 bg-transparent text-muted-foreground hover:text-primary hover:bg-transparent border-0 shadow-none transition-colors"
            title="New Social Platform"
          >
            <Link href="/admin/social-platforms/new">
              <FontAwesomeIcon icon={faPlus} className="h-5 w-5" />
            </Link>
          </Button>
        </AdminToolbar>

        {filteredSocialPlatforms.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/60 bg-muted/30 p-8 text-center text-muted-foreground">
            {searchQuery
              ? "No social platforms found matching your search"
              : "No social platforms found"}
          </div>
        ) : (
          <div className="space-y-2">
            <CardListContainer
              items={filteredSocialPlatforms}
              renderContent={renderContent}
              renderActions={renderActions}
            />
          </div>
        )}
      </div>
    </div>
  );
}

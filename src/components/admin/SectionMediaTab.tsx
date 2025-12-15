"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { InputShadow } from "@/components/admin/forms/InputShadow";
import { AdminToolbar } from "@/components/admin/AdminToolbar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import { MediaCard } from "@/components/admin/MediaCard";
import { MediaRenderer } from "@/components/MediaRenderer";
import { MediaForm } from "@/features/media/components/MediaForm";
import { PageSectionStatusSelector } from "@/components/admin/PageSectionStatusSelector";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { Media, MediaWithSection } from "@/features/media/types";

type SectionMediaTabProps = {
  sectionId: string;
  initialMedia: MediaWithSection[];
  sectionType?: string;
};

export function SectionMediaTab({ sectionId, initialMedia, sectionType }: SectionMediaTabProps) {
  const [sectionMedia, setSectionMedia] = useState<MediaWithSection[]>(initialMedia);
  const [allMedia, setAllMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddMediaDialogOpen, setIsAddMediaDialogOpen] = useState(false);
  const [editingMedia, setEditingMedia] = useState<Media | null>(null);
  const [previewMedia, setPreviewMedia] = useState<Media | null>(null);
  const [wistiaThumbnails, setWistiaThumbnails] = useState<Record<string, string>>({});

  useEffect(() => {
    loadAllMedia();
    loadSectionMedia();
  }, [sectionId]);

  // Fetch Wistia thumbnails via oEmbed API
  useEffect(() => {
    const fetchWistiaThumbnails = async () => {
      // Combine allMedia and sectionMedia to ensure we fetch thumbnails for all displayed items
      const allDisplayedMedia = [...allMedia, ...sectionMedia];
      const wistiaItems = allDisplayedMedia.filter((item) => item.source_type === "wistia" && item.embed_id);
      const thumbnailsToFetch = wistiaItems.filter(
        (item) => !wistiaThumbnails[item.embed_id!] && item.embed_id
      );

      if (thumbnailsToFetch.length === 0) return;

      for (const item of thumbnailsToFetch) {
        if (!item.embed_id) continue;
        try {
          const response = await fetch(
            `https://fast.wistia.com/oembed?url=https://home.wistia.com/medias/${item.embed_id}&format=json`
          );
          if (response.ok) {
            const data = await response.json();
            if (data.thumbnail_url) {
              setWistiaThumbnails((prev) => ({
                ...prev,
                [item.embed_id!]: data.thumbnail_url,
              }));
            }
          } else {
            console.warn(`Wistia oEmbed API returned ${response.status} for embed_id: ${item.embed_id}`);
          }
        } catch (error) {
          // Silently fail - will use fallback
          console.error(`Failed to fetch Wistia thumbnail for ${item.embed_id}:`, error);
        }
      }
    };

    // Fetch thumbnails whenever media lists change
    if (allMedia.length > 0 || sectionMedia.length > 0) {
      fetchWistiaThumbnails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allMedia, sectionMedia]);

  const loadAllMedia = async () => {
    try {
      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      const response = await fetch("/api/admin/media", {
        headers: {
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
      });

      if (response.ok) {
        const media = await response.json();
        setAllMedia(media);
      }
    } catch (error) {
      console.error("Error loading all media:", error);
    }
  };

  const loadSectionMedia = async () => {
    try {
      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      const response = await fetch(`/api/admin/sections/${sectionId}/media`, {
        headers: {
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
      });

      if (response.ok) {
        const media = await response.json();
        setSectionMedia(media);
      }
    } catch (error) {
      console.error("Error loading section media:", error);
    }
  };

  const handleSelectMedia = async (mediaId: string) => {
    try {
      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      // For stories sections, allow multiple media items
      // For other sections (like hero), only allow one media item
      const allowMultiple = sectionType === "stories";
      
      if (!allowMultiple && sectionMedia.length > 0) {
        // Remove existing media first (sections can only have one)
        const existingMediaId = sectionMedia[0].section_media.id;
        await fetch(`/api/admin/sections/${sectionId}/media?section_media_id=${existingMediaId}`, {
          method: "DELETE",
          headers: {
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          },
        });
      }

      // Calculate sort_order for new media
      const maxSortOrder = sectionMedia.length > 0 
        ? Math.max(...sectionMedia.map(m => m.section_media.sort_order))
        : 0;
      const newSortOrder = allowMultiple ? maxSortOrder + 1 : 1;

      // Add new media
      const response = await fetch(`/api/admin/sections/${sectionId}/media`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({
          media_id: mediaId,
          role: "main",
          sort_order: newSortOrder,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to add media to section");
      }

      const mediaWithMetadata = await response.json();
      
      if (allowMultiple) {
        // Add to existing media for stories sections
        setSectionMedia([...sectionMedia, mediaWithMetadata]);
      } else {
        // Replace existing media for single-media sections
        setSectionMedia([mediaWithMetadata]);
      }
      
      toast.success("Media selected successfully");
    } catch (error: any) {
      console.error("Error selecting media:", error);
      toast.error(error.message || "Failed to select media");
    }
  };

  const handleRemoveMedia = async (mediaId: string): Promise<void> => {
    try {
      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      const mediaItem = sectionMedia.find((m) => m.id === mediaId);
      if (!mediaItem) return;

      const response = await fetch(
        `/api/admin/sections/${sectionId}/media?section_media_id=${mediaItem.section_media.id}`,
        {
          method: "DELETE",
          headers: {
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to remove media");
      }

      setSectionMedia(sectionMedia.filter((m) => m.id !== mediaId));
      toast.success("Media removed successfully");
    } catch (error: any) {
      console.error("Error removing media:", error);
      toast.error(error.message || "Failed to remove media");
      throw error; // Re-throw so ActionMenu can handle it
    }
  };

  const handleDeleteMedia = async (mediaId: string): Promise<void> => {
    try {
      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      const response = await fetch(`/api/admin/media/${mediaId}`, {
        method: "DELETE",
        headers: {
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete media");
      }

      // If media was selected, remove it from section
      if (sectionMedia.some((m) => m.id === mediaId)) {
        await handleRemoveMedia(mediaId);
      }

      // Reload media lists
      await loadAllMedia();
      await loadSectionMedia();
      toast.success("Media deleted successfully");
    } catch (error: any) {
      console.error("Error deleting media:", error);
      toast.error(error.message || "Failed to delete media");
      throw error; // Re-throw so ActionMenu can handle it
    }
  };

  const handleNewMediaCreated = async () => {
    setIsAddMediaDialogOpen(false);
    await loadAllMedia();
    // The new media will be available in the unselected list
  };

  const handleEditMedia = (media: Media) => {
    setEditingMedia(media);
  };

  const handleEditMediaSuccess = async () => {
    setEditingMedia(null);
    await loadAllMedia();
    await loadSectionMedia();
  };

  const selectedMediaIds = new Set(sectionMedia.map((m) => m.id));
  const unselectedMedia = allMedia.filter((m) => !selectedMediaIds.has(m.id));

  const filteredSelectedMedia = sectionMedia.filter((item) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      (item.name || "").toLowerCase().includes(query) ||
      item.url.toLowerCase().includes(query) ||
      item.type.toLowerCase().includes(query) ||
      item.source_type.toLowerCase().includes(query)
    );
  });

  const filteredUnselectedMedia = unselectedMedia.filter((item) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      (item.name || "").toLowerCase().includes(query) ||
      item.url.toLowerCase().includes(query) ||
      item.type.toLowerCase().includes(query) ||
      item.source_type.toLowerCase().includes(query)
    );
  });

  return (
    <div className="w-full space-y-4">
      <AdminToolbar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search media..."
      >
        <Button
          onClick={() => setIsAddMediaDialogOpen(true)}
          variant="ghost"
          className="rounded-full w-10 h-10 p-0 bg-transparent text-muted-foreground hover:text-primary hover:bg-transparent border-0 shadow-none transition-colors"
          title="Add Media"
        >
          <FontAwesomeIcon icon={faPlus} className="h-5 w-5" />
        </Button>
      </AdminToolbar>

      {/* Selected Media Section */}
      {filteredSelectedMedia.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
            {filteredSelectedMedia.map((item) => (
              <MediaCard
                key={item.id}
                item={item}
                wistiaThumbnails={wistiaThumbnails}
                onPreview={setPreviewMedia}
                onEdit={handleEditMedia}
                onDelete={async (mediaItem) => {
                  await handleDeleteMedia(mediaItem.id);
                }}
                onDeselect={async (mediaItem) => {
                  await handleRemoveMedia(mediaItem.id);
                }}
                isSelected={true}
                borderVariant="selected"
                statusSelector={
                  <PageSectionStatusSelector
                    status={item.section_media.status}
                    onStatusChange={async (newStatus) => {
                      const supabase = createClient();
                      const { data: sessionData } = await supabase.auth.getSession();
                      const accessToken = sessionData?.session?.access_token;
                      
                      const response = await fetch(`/api/admin/sections/${sectionId}/media/${item.section_media.id}`, {
                        method: "PATCH",
                        headers: {
                          "Content-Type": "application/json",
                          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
                        },
                        body: JSON.stringify({ status: newStatus }),
                      });
                      
                      if (response.ok) {
                        await loadSectionMedia();
                      }
                    }}
                  />
                }
              />
            ))}
        </div>
      )}

      {/* Unselected Media Section */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">
            {sectionMedia.length > 0 ? "Other Media" : "Available Media"}
          </h3>
          <p className="text-sm text-muted-foreground">
            Use the action menu (three dots) to select or deselect media items
          </p>
        </div>
        {filteredUnselectedMedia.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground border rounded-lg">
            {searchQuery
              ? "No unselected media found matching your search"
              : "No other media available"}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredUnselectedMedia.map((item) => (
              <MediaCard
                key={item.id}
                item={item}
                wistiaThumbnails={wistiaThumbnails}
                onPreview={setPreviewMedia}
                onEdit={handleEditMedia}
                onDelete={async (mediaItem) => {
                  await handleDeleteMedia(mediaItem.id);
                }}
                onSelect={async (mediaItem) => {
                  await handleSelectMedia(mediaItem.id);
                }}
                isSelected={false}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add Media Dialog */}
      <Dialog open={isAddMediaDialogOpen} onOpenChange={setIsAddMediaDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Media</DialogTitle>
            <DialogDescription>
              Add a new media item to your library
            </DialogDescription>
          </DialogHeader>
          <MediaForm onSuccess={handleNewMediaCreated} onCancel={() => setIsAddMediaDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Edit Media Dialog */}
      {editingMedia && (
        <Dialog open={!!editingMedia} onOpenChange={() => setEditingMedia(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Media</DialogTitle>
              <DialogDescription>
                Update media item details
              </DialogDescription>
            </DialogHeader>
            <MediaForm 
              initialData={editingMedia} 
              isEdit={true}
              onSuccess={handleEditMediaSuccess} 
              onCancel={() => setEditingMedia(null)} 
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Preview Dialog */}
      {previewMedia && (
        <Dialog open={!!previewMedia} onOpenChange={() => setPreviewMedia(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>{previewMedia.name || "Media Preview"}</DialogTitle>
            </DialogHeader>
            <div className="aspect-video bg-muted rounded-lg overflow-hidden">
              <MediaRenderer media={previewMedia} />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

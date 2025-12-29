"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useMedia, useDeleteMedia } from "@/lib/react-query/hooks";
import { Button } from "@/components/ui/button";
import { InputShadow } from "@/components/admin/forms/InputShadow";
import { AdminToolbar } from "@/components/admin/AdminToolbar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faEdit,
  faTrash,
  faCopy,
  faImage,
  faVideo,
  faFile,
  faLink,
  faPlay,
} from "@fortawesome/free-solid-svg-icons";
import { MediaForm } from "./MediaForm";
import { MediaRenderer } from "@/components/MediaRenderer";
import { MediaCard } from "@/components/admin/MediaCard";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";
import type { Media } from "../types";

type MediaLibraryProps = {
  initialMedia: Media[];
};

export function MediaLibrary({ initialMedia }: MediaLibraryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingMedia, setEditingMedia] = useState<Media | null>(null);
  const [previewMedia, setPreviewMedia] = useState<Media | null>(null);
  const [wistiaThumbnails, setWistiaThumbnails] = useState<Record<string, string>>({});
  const [deletingMediaId, setDeletingMediaId] = useState<string | null>(null);
  const router = useRouter();

  // Use React Query hook with server-side search
  const { data: media = initialMedia, isLoading, error } = useMedia(
    debouncedSearch || undefined,
    { initialData: initialMedia }
  );
  const deleteMedia = useDeleteMedia();

  const handleDeleteClick = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setDeletingMediaId(id);
  };

  const handleDelete = async () => {
    if (!deletingMediaId) return;

    try {
      await deleteMedia.mutateAsync(deletingMediaId);
      toast.success("Media deleted successfully");
      setDeletingMediaId(null);
    } catch (error: any) {
      console.error("Error deleting media:", error);
      toast.error(error.message || "Failed to delete media");
    }
  };

  const isDeleting = deleteMedia.isPending;

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("URL copied to clipboard");
  };

  const handleCreateSuccess = () => {
    setIsCreateDialogOpen(false);
    // React Query will automatically refetch on mutation success
  };

  const handleEditSuccess = () => {
    setEditingMedia(null);
    // React Query will automatically refetch on mutation success
  };

  // Fetch Wistia thumbnails via oEmbed API
  useEffect(() => {
    const fetchWistiaThumbnails = async () => {
      const wistiaItems = media.filter((item) => item.source_type === "wistia" && item.embed_id);
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
          }
        } catch (error) {
          // Silently fail - will use fallback
          console.error(`Failed to fetch Wistia thumbnail for ${item.embed_id}:`, error);
        }
      }
    };

    if (media.length > 0) {
      fetchWistiaThumbnails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [media]);

  const getMediaIcon = (type: string, sourceType: string) => {
    if (sourceType === "wistia" || sourceType === "youtube" || sourceType === "vimeo") {
      return faVideo;
    }
    if (type === "image") return faImage;
    if (type === "video") return faVideo;
    return faFile;
  };

  const getMediaPreview = (item: Media) => {
    // Wistia thumbnail - use fetched thumbnail or generate from embed_id (skip thumbnail_url check for Wistia)
    if (item.source_type === "wistia" && item.embed_id) {
      // First try to use the fetched thumbnail from oEmbed API
      const fetchedThumbnail = wistiaThumbnails[item.embed_id];
      if (fetchedThumbnail) {
        return (
          <img
            src={fetchedThumbnail}
            alt={item.name || "Wistia Video"}
            className="w-full h-full object-cover"
            onError={(e) => {
              // If fetched thumbnail fails, try direct format
              const img = e.target as HTMLImageElement;
              img.src = `https://embed.wistia.com/deliveries/${item.embed_id}.jpg`;
            }}
          />
        );
      }

      // Fallback: Try direct Wistia thumbnail URL format while fetching
      const wistiaThumbnail = `https://embed.wistia.com/deliveries/${item.embed_id}.jpg`;
      return (
        <img
          src={wistiaThumbnail}
          alt={item.name || "Wistia Video"}
          className="w-full h-full object-cover"
          onError={(e) => {
            const img = e.target as HTMLImageElement;
            // Try alternative format
            if (img.src.includes('embed.wistia.com/deliveries')) {
              img.src = `https://fast.wistia.com/embed/medias/${item.embed_id}/thumbnail.jpg`;
            } else {
              // If all fail, don't hide - show a video placeholder instead of generic icon
              img.style.display = "none";
            }
          }}
        />
      );
    }

    // YouTube thumbnail - generate from embed_id
    if (item.source_type === "youtube" && item.embed_id) {
      const youtubeThumbnail = `https://img.youtube.com/vi/${item.embed_id}/maxresdefault.jpg`;
      return (
        <img
          src={youtubeThumbnail}
          alt={item.name || "Media"}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback to default thumbnail if maxresdefault doesn't exist
            (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${item.embed_id}/hqdefault.jpg`;
          }}
        />
      );
    }

    // Vimeo thumbnail - would need API call, but for now show icon
    if (item.source_type === "vimeo" && item.embed_id) {
      // Vimeo requires API call for thumbnail, so we'll show icon for now
      // Could be enhanced later with API integration
    }

    // Only check thumbnail_url for non-Wistia items
    if (item.source_type !== "wistia" && item.thumbnail_url) {
      return (
        <img
          src={item.thumbnail_url}
          alt={item.name || "Media"}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      );
    }

    if (item.type === "image" && item.url) {
      return (
        <img
          src={item.url}
          alt={item.name || "Media"}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      );
    }

    if (item.type === "video" && item.source_type === "upload" && item.url) {
      return (
        <video
          src={item.url}
          className="w-full h-full object-cover"
          muted
          playsInline
        />
      );
    }

    return (
      <div className="flex items-center justify-center h-full bg-muted">
        <FontAwesomeIcon
          icon={getMediaIcon(item.type, item.source_type)}
          className="h-8 w-8 text-muted-foreground"
        />
      </div>
    );
  };

  return (
    <div className="w-full">
        <div className="mb-6 md:mb-8">
          <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-3 mb-2">
            <h1 className="text-4xl font-bold text-foreground leading-none">Media Library</h1>
            <span className="inline-flex items-center justify-center h-5 px-2.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 leading-none">
              ({media.length} {media.length === 1 ? "item" : "items"})
            </span>
          </div>
          <p className="text-base text-muted-foreground">
            Manage and organize your media files, videos, and external media links.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <AdminToolbar
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search media..."
        >
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            variant="ghost"
            className="rounded-full w-10 h-10 p-0 bg-transparent text-muted-foreground hover:text-primary hover:bg-transparent border-0 shadow-none transition-colors"
            title="Add Media"
          >
            <FontAwesomeIcon icon={faPlus} className="h-5 w-5" />
          </Button>
        </AdminToolbar>

        {isLoading && !media.length ? (
          <div className="text-center py-12 text-muted-foreground">
            Loading media...
          </div>
        ) : error ? (
          <div className="text-center py-12 text-muted-foreground">
            Error loading media. Please try again.
          </div>
        ) : media.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            {searchQuery
              ? "No media found matching your search"
              : "No media items yet. Click the + button to add your first media item."}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {media.map((item) => (
              <MediaCard
                key={item.id}
                item={item}
                wistiaThumbnails={wistiaThumbnails}
                onPreview={setPreviewMedia}
                onEdit={setEditingMedia}
                onDelete={async () => {
                  await deleteMedia.mutateAsync(item.id);
                  toast.success("Media deleted successfully");
                }}
                onCopyUrl={handleCopyUrl}
                showDelete={true}
                showCopyUrl={true}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent 
          className="max-h-[90vh] overflow-y-auto"
          style={{ width: '90vw', maxWidth: '40rem' }}
        >
          <DialogHeader>
            <DialogTitle>Add Media</DialogTitle>
            <DialogDescription>
              Upload a file, add a URL, or link to Wistia, YouTube, or Vimeo.
            </DialogDescription>
          </DialogHeader>
          <MediaForm
            onSuccess={handleCreateSuccess}
            onCancel={() => setIsCreateDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingMedia} onOpenChange={(open) => !open && setEditingMedia(null)}>
        <DialogContent 
          className="max-h-[90vh] overflow-y-auto"
          style={{ width: '90vw', maxWidth: '40rem' }}
        >
          <DialogHeader>
            <DialogTitle>Edit Media</DialogTitle>
            <DialogDescription>
              Update media information and settings.
            </DialogDescription>
          </DialogHeader>
          {editingMedia && (
            <MediaForm
              initialData={editingMedia}
              isEdit={true}
              onSuccess={handleEditSuccess}
              onCancel={() => setEditingMedia(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Media Preview Dialog */}
      <Dialog open={!!previewMedia} onOpenChange={(open) => !open && setPreviewMedia(null)}>
        <DialogContent 
          className="max-w-4xl overflow-hidden flex flex-col p-0" 
          style={{ width: '90%', maxWidth: '56rem', maxHeight: '90vh' }}
        >
          <DialogHeader className="flex-shrink-0 px-6 mt-6 pt-6 pb-4">
            <DialogTitle>{previewMedia?.name || "Media Preview"}</DialogTitle>
            <DialogDescription>
              {previewMedia && (
                <span className="capitalize">
                  {previewMedia.type} • {previewMedia.source_type.replace("_", " ")}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto min-h-0 px-6 pb-6">
            {previewMedia && (
              <div className="w-full aspect-video bg-muted rounded-lg overflow-hidden">
                <MediaRenderer
                  media={previewMedia}
                  className="w-full h-full"
                  autoPlay={false}
                  muted={true}
                  loop={false}
                  controls={true}
                />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingMediaId} onOpenChange={(open) => !open && setDeletingMediaId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete{" "}
              {deletingMediaId && (
                <strong>
                  {media.find((m) => m.id === deletingMediaId)?.name || "this media item"}
                </strong>
              )}
              .
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faImage,
  faVideo,
  faFile,
  faEdit,
  faTrash,
  faCopy,
  faPlay,
  faCheck,
  faX,
} from "@fortawesome/free-solid-svg-icons";
import { Button } from "@/components/ui/button";
import { ActionMenu } from "@/components/admin/ui/ActionMenu";
import { cn } from "@/lib/utils";
import type { Media } from "@/features/page-builder/media/types";
import { ReactNode } from "react";

type MediaCardProps = {
  item: Media;
  wistiaThumbnails?: Record<string, string>;
  onPreview?: (item: Media) => void;
  onEdit?: (item: Media) => void;
  onDelete?: (item: Media) => void;
  onDuplicate?: (item: Media) => void;
  onSelect?: (item: Media) => void;
  onDeselect?: (item: Media) => void;
  onCopyUrl?: (url: string) => void;
  isSelected?: boolean;
  showDelete?: boolean;
  showSelect?: boolean;
  showCopyUrl?: boolean;
  borderVariant?: "default" | "selected";
  statusSelector?: ReactNode;
};

export function MediaCard({
  item,
  wistiaThumbnails = {},
  onPreview,
  onEdit,
  onDelete,
  onDuplicate,
  onSelect,
  onDeselect,
  onCopyUrl,
  isSelected = false,
  showDelete = false,
  showSelect = false,
  showCopyUrl = false,
  borderVariant = "default",
  statusSelector,
}: MediaCardProps) {
  const getMediaIcon = (type: string, sourceType: string) => {
    if (sourceType === "wistia" || sourceType === "youtube" || sourceType === "vimeo") {
      return faVideo;
    }
    if (type === "image") return faImage;
    if (type === "video") return faVideo;
    return faFile;
  };

  const getMediaPreview = (item: Media) => {
    // Wistia thumbnail - use fetched thumbnail or generate from embed_id
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
              const img = e.target as HTMLImageElement;
              const embedId = item.embed_id!;
              img.src = `https://embed-ssl.wistia.com/deliveries/${embedId}.jpg`;
            }}
          />
        );
      }

      // Fallback: Try direct Wistia thumbnail URL formats
      const wistiaThumbnail = `https://embed-ssl.wistia.com/deliveries/${item.embed_id}.jpg`;
      return (
        <img
          src={wistiaThumbnail}
          alt={item.name || "Wistia Video"}
          className="w-full h-full object-cover"
          onError={(e) => {
            const img = e.target as HTMLImageElement;
            const embedId = item.embed_id!;
            if (img.src.includes('embed-ssl.wistia.com/deliveries')) {
              img.src = `https://embed.wistia.com/deliveries/${embedId}.jpg`;
            } else if (img.src.includes('embed.wistia.com/deliveries')) {
              img.src = `https://fast.wistia.com/embed/medias/${embedId}/thumbnail.jpg`;
            } else {
              img.style.display = "none";
            }
          }}
        />
      );
    }

    // YouTube thumbnail
    if (item.source_type === "youtube" && item.embed_id) {
      const youtubeThumbnail = `https://img.youtube.com/vi/${item.embed_id}/maxresdefault.jpg`;
      return (
        <img
          src={youtubeThumbnail}
          alt={item.name || "Media"}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${item.embed_id}/hqdefault.jpg`;
          }}
        />
      );
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

  const borderClass = borderVariant === "selected" 
    ? "border-2 border-primary" 
    : "border";

  return (
    <div
      className={cn(
        "group relative bg-card rounded-lg overflow-hidden hover:shadow-lg transition-shadow",
        borderClass
      )}
    >
      {/* Preview */}
      <div 
        className="aspect-video bg-muted relative overflow-hidden cursor-pointer" 
        onClick={() => onPreview?.(item)}
      >
        {getMediaPreview(item)}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-black/60 rounded-full w-12 h-12 flex items-center justify-center">
              <FontAwesomeIcon icon={faPlay} className="h-5 w-5 text-white ml-0.5" />
            </div>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-sm line-clamp-2 flex-1">{item.name || "Untitled Media"}</h3>
          <div className="flex items-center gap-1 flex-shrink-0">
            {statusSelector}
            <FontAwesomeIcon
              icon={getMediaIcon(item.type, item.source_type)}
              className="h-4 w-4 text-muted-foreground"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="capitalize">{item.type}</span>
          <span>•</span>
          <span className="capitalize">{item.source_type.replace("_", " ")}</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2 border-t">
          {showCopyUrl && (
            <Button
              size="sm"
              variant="ghost"
              className="flex-1 h-8 text-xs"
              onClick={(e) => {
                e.stopPropagation();
                onCopyUrl?.(item.url);
              }}
              title="Copy URL"
            >
              <FontAwesomeIcon icon={faCopy} className="h-3 w-3 mr-1" />
              Copy URL
            </Button>
          )}
          
          {showSelect && (
            <>
              {isSelected ? (
                <Button
                  size="sm"
                  variant="ghost"
                  className="flex-1 h-8 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeselect?.(item);
                  }}
                  title="Deselect"
                >
                  <FontAwesomeIcon icon={faX} className="h-3 w-3 mr-1" />
                  Deselect
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="ghost"
                  className="flex-1 h-8 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect?.(item);
                  }}
                  title="Select"
                >
                  <FontAwesomeIcon icon={faCheck} className="h-3 w-3 mr-1" />
                  Select
                </Button>
              )}
            </>
          )}

          <div className="flex items-center gap-1">
            {onEdit && (
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(item);
                }}
                title="Edit"
              >
                <FontAwesomeIcon icon={faEdit} className="h-3 w-3" />
              </Button>
            )}
            
            {showDelete && onDelete && (
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(item);
                }}
                title="Delete"
              >
                <FontAwesomeIcon icon={faTrash} className="h-3 w-3" />
              </Button>
            )}

            {/* ActionMenu for section tabs - shows Select/Deselect in menu */}
            {!showSelect && !showDelete && (onSelect || onDeselect) && (
              <ActionMenu
                itemId={item.id}
                onEdit={onEdit ? () => onEdit(item) : undefined}
                onDelete={onDelete ? async () => await onDelete(item) : undefined}
                onDuplicate={onDuplicate ? async () => await onDuplicate(item) : undefined}
                deleteLabel="this media"
                customActions={[
                  ...(isSelected && onDeselect
                    ? [
                        {
                          label: "Deselect",
                          icon: <FontAwesomeIcon icon={faX} className="h-4 w-4" />,
                          onClick: async () => {
                            await onDeselect(item);
                          },
                        },
                      ]
                    : []),
                  ...(!isSelected && onSelect
                    ? [
                        {
                          label: "Select",
                          icon: <FontAwesomeIcon icon={faCheck} className="h-4 w-4" />,
                          onClick: async () => {
                            await onSelect(item);
                          },
                        },
                      ]
                    : []),
                ]}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

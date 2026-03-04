"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { InputShadow } from "@/components/admin/forms/InputShadow";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faImage,
  faVideo,
  faFile,
  faCheck,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";
import { cn } from "@/lib/utils";
import type { Media } from "../types";

type MediaSelectorProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (mediaIds: string[]) => void;
  selectedMediaIds?: string[];
  multiple?: boolean;
};

export function MediaSelector({
  open,
  onOpenChange,
  onSelect,
  selectedMediaIds = [],
  multiple = true,
}: MediaSelectorProps) {
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>(selectedMediaIds);

  useEffect(() => {
    if (open) {
      setSelectedIds(selectedMediaIds);
      fetchMedia();
    }
  }, [open, selectedMediaIds]);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("media")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      setMedia(data || []);
    } catch (error) {
      console.error("Error fetching media:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMedia = media.filter((item) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      (item.name || "").toLowerCase().includes(query) ||
      item.url.toLowerCase().includes(query) ||
      item.type.toLowerCase().includes(query) ||
      item.source_type.toLowerCase().includes(query)
    );
  });

  const handleToggleSelect = (mediaId: string) => {
    if (multiple) {
      setSelectedIds((prev) =>
        prev.includes(mediaId)
          ? prev.filter((id) => id !== mediaId)
          : [...prev, mediaId]
      );
    } else {
      setSelectedIds([mediaId]);
    }
  };

  const handleConfirm = () => {
    onSelect(selectedIds);
    onOpenChange(false);
  };

  const getMediaIcon = (type: string, sourceType: string) => {
    if (sourceType === "wistia" || sourceType === "youtube" || sourceType === "vimeo") {
      return faVideo;
    }
    if (type === "image") return faImage;
    if (type === "video") return faVideo;
    return faFile;
  };

  const getMediaPreview = (item: Media) => {
    if (item.thumbnail_url) {
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {multiple ? "Select Media" : "Select a Media Item"}
          </DialogTitle>
          <DialogDescription>
            {multiple
              ? "Choose one or more media items to add to this section."
              : "Choose a media item to add to this section."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 space-y-4 overflow-hidden flex flex-col">
          {/* Search */}
          <div className="relative">
            <FontAwesomeIcon
              icon={faSearch}
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            />
            <InputShadow
              placeholder="Search media..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Media Grid */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">Loading...</div>
            ) : filteredMedia.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                {searchQuery
                  ? "No media found matching your search"
                  : "No media items available"}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {filteredMedia.map((item) => {
                  const isSelected = selectedIds.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleToggleSelect(item.id)}
                      className={cn(
                        "group relative bg-card border rounded-lg overflow-hidden cursor-pointer transition-all",
                        isSelected
                          ? "ring-2 ring-primary border-primary"
                          : "hover:border-primary/50 hover:shadow-md"
                      )}
                    >
                      {/* Preview */}
                      <div className="aspect-video bg-muted relative overflow-hidden">
                        {getMediaPreview(item)}
                        {isSelected && (
                          <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                            <div className="bg-primary text-primary-foreground rounded-full p-2">
                              <FontAwesomeIcon icon={faCheck} className="h-4 w-4" />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="p-2">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-medium text-xs line-clamp-2 flex-1">
                            {item.name || "Untitled Media"}
                          </h3>
                          <FontAwesomeIcon
                            icon={getMediaIcon(item.type, item.source_type)}
                            className="h-3 w-3 text-muted-foreground flex-shrink-0 mt-0.5"
                          />
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-1 capitalize">
                          {item.type} • {item.source_type.replace("_", " ")}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={selectedIds.length === 0}>
            Select {selectedIds.length > 0 && `(${selectedIds.length})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

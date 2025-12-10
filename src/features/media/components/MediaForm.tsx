"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { InputShadow } from "@/components/admin/forms/InputShadow";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { VideoUploadField } from "@/components/admin/forms/VideoUploadField";
import type { Media } from "../types";

const formSchema = z.object({
  source_type: z.enum(["upload", "wistia", "youtube", "vimeo", "external_url"]),
  name: z.string().optional(),
  url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  embed_id: z.string().optional(),
  thumbnail_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

type FormValues = z.infer<typeof formSchema>;

type MediaFormProps = {
  initialData?: Media | null;
  isEdit?: boolean;
  onSuccess?: (media: Media) => void;
  onCancel?: () => void;
};

/**
 * Extract Wistia video ID from URL
 * Example: https://fast.wistia.com/embed/medias/abc123def4.jsonp -> abc123def4
 */
function extractWistiaId(url: string): string | null {
  const patterns = [
    /wistia\.com\/medias\/([a-zA-Z0-9]{10})/,
    /wi\.st\/([a-zA-Z0-9]{10})/,
    /fast\.wistia\.com\/embed\/iframe\/([a-zA-Z0-9]{10})/,
    /fast\.wistia\.com\/embed\/medias\/([a-zA-Z0-9]{10})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  // Check if it's already just an ID
  if (/^[a-zA-Z0-9]{10}$/.test(url)) {
    return url;
  }

  return null;
}

/**
 * Extract YouTube video ID from URL
 */
function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * Extract Vimeo video ID from URL
 */
function extractVimeoId(url: string): string | null {
  const patterns = [
    /(?:vimeo\.com\/|player\.vimeo\.com\/video\/)(\d+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

export function MediaForm({ initialData, isEdit = false, onSuccess, onCancel }: MediaFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [wistiaUrl, setWistiaUrl] = useState(initialData?.source_type === "wistia" ? (initialData?.embed_id || "") : "");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      source_type: (initialData?.source_type as "wistia" | "youtube" | "vimeo" | "upload" | "external_url" | undefined) || "upload",
      name: initialData?.name || "",
      url: initialData?.url || "",
      embed_id: initialData?.embed_id || "",
      thumbnail_url: initialData?.thumbnail_url || "",
    },
  });

  const sourceType = form.watch("source_type");

  // Handle Wistia URL or ID input
  const handleWistiaUrlChange = (input: string) => {
    setWistiaUrl(input);
    // Check if it's already just an ID (10 alphanumeric characters)
    if (/^[a-zA-Z0-9]{10}$/.test(input)) {
      form.setValue("embed_id", input);
    } else {
      // Try to extract ID from URL
      const embedId = extractWistiaId(input);
      if (embedId) {
        form.setValue("embed_id", embedId);
      }
    }
    // Don't set url or thumbnail_url for Wistia
  };

  // Handle YouTube URL input
  const handleYouTubeUrlChange = (url: string) => {
    const embedId = extractYouTubeId(url);
    if (embedId) {
      form.setValue("embed_id", embedId);
      form.setValue("url", `https://www.youtube.com/embed/${embedId}`);
      form.setValue("source_type", "youtube");
    } else if (url) {
      form.setValue("url", url);
    }
  };

  // Handle Vimeo URL input
  const handleVimeoUrlChange = (url: string) => {
    const embedId = extractVimeoId(url);
    if (embedId) {
      form.setValue("embed_id", embedId);
      form.setValue("url", `https://player.vimeo.com/video/${embedId}`);
      form.setValue("source_type", "vimeo");
    } else if (url) {
      form.setValue("url", url);
    }
  };

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      // For Wistia, ensure embed_id is extracted from wistiaUrl if not already set
      let finalEmbedId: string | null = values.embed_id || null;
      if (values.source_type === "wistia" && wistiaUrl && !finalEmbedId) {
        // Check if it's already just an ID
        if (/^[a-zA-Z0-9]{10}$/.test(wistiaUrl)) {
          finalEmbedId = wistiaUrl;
        } else {
          // Try to extract ID from URL
          finalEmbedId = extractWistiaId(wistiaUrl);
        }
      }

      let mediaUrl = values.url || "";

      // Handle file upload
      if (selectedFile && values.source_type === "upload") {
        const folderPath = isEdit && initialData
          ? `media/${initialData.id}`
          : "media/temp";

        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("folderPath", folderPath);

        const uploadResponse = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadResponse.ok) {
          const error = await uploadResponse.json();
          throw new Error(error.error || "Failed to upload media");
        }

        const uploadData = await uploadResponse.json();
        mediaUrl = uploadData.url;
        if (mediaUrl && !mediaUrl.startsWith("http://") && !mediaUrl.startsWith("https://")) {
          mediaUrl = `https://${mediaUrl}`;
        }
      }

      const payload: any = {
        source_type: values.source_type,
        name: values.name || null,
        embed_id: finalEmbedId || null,
      };

      // For Wistia, don't set url or thumbnail_url
      if (values.source_type !== "wistia") {
        payload.url = mediaUrl;
        payload.thumbnail_url = values.thumbnail_url || null;
      } else {
        // For Wistia, set a placeholder URL (required by DB) but we only use embed_id
        if (!finalEmbedId) {
          throw new Error("Wistia video ID is required. Please enter a Wistia link or video ID.");
        }
        payload.url = `wistia:${finalEmbedId}`;
      }

      const url = isEdit && initialData
        ? `/api/admin/media/${initialData.id}`
        : "/api/admin/media";
      const method = isEdit ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Failed to ${isEdit ? "update" : "create"} media`);
      }

      const createdMedia = await response.json();
      toast.success(`Media ${isEdit ? "updated" : "created"} successfully`);
      onSuccess?.(createdMedia);
    } catch (error: any) {
      console.error("Error saving media:", error);
      toast.error(error.message || `Failed to ${isEdit ? "update" : "create"} media`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={(e) => { e.preventDefault(); e.stopPropagation(); form.handleSubmit(onSubmit)(e); return false; }} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="source_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Source Type</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-input-background">
                      <SelectValue placeholder="Select source type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="upload">Upload</SelectItem>
                    <SelectItem value="wistia">Wistia</SelectItem>
                    <SelectItem value="youtube">YouTube</SelectItem>
                    <SelectItem value="vimeo">Vimeo</SelectItem>
                    <SelectItem value="external_url">External URL</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name (optional)</FormLabel>
                <FormControl>
                  <InputShadow placeholder="Enter media name (optional)" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {sourceType === "wistia" && (
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Wistia Link or Video ID
            </label>
            <InputShadow
              placeholder="abc123def4 or https://fast.wistia.com/embed/medias/abc123def4.jsonp"
              value={wistiaUrl}
              onChange={(e) => {
                const input = e.target.value;
                setWistiaUrl(input);
                handleWistiaUrlChange(input);
              }}
            />
            <p className="text-sm text-muted-foreground">
              Paste a Wistia link or video ID. The ID will be extracted automatically.
            </p>
          </div>
        )}

        {sourceType === "youtube" && (
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              YouTube URL
            </label>
            <InputShadow
              placeholder="https://www.youtube.com/watch?v=..."
              value={form.watch("url")}
              onChange={(e) => handleYouTubeUrlChange(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              Paste a YouTube URL. The video ID will be extracted automatically.
            </p>
          </div>
        )}

        {sourceType === "vimeo" && (
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Vimeo URL
            </label>
            <InputShadow
              placeholder="https://vimeo.com/..."
              value={form.watch("url")}
              onChange={(e) => handleVimeoUrlChange(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              Paste a Vimeo URL. The video ID will be extracted automatically.
            </p>
          </div>
        )}

        {sourceType === "upload" && (
          <FormField
            control={form.control}
            name="url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Media URL</FormLabel>
                <FormControl>
                  <VideoUploadField
                    value={field.value || null}
                    onChange={(url) => field.onChange(url || "")}
                    onFileChange={setSelectedFile}
                    folderPath={isEdit && initialData ? `media/${initialData.id}` : "media/temp"}
                    error={form.formState.errors.url?.message}
                    placeholder="https://example.com/video.mp4"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {sourceType === "external_url" && (
          <FormField
            control={form.control}
            name="url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>External URL</FormLabel>
                <FormControl>
                  <InputShadow placeholder="https://example.com/media" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {sourceType !== "upload" && sourceType !== "wistia" && sourceType !== "youtube" && sourceType !== "vimeo" && (
          <FormField
            control={form.control}
            name="url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL</FormLabel>
                <FormControl>
                  <InputShadow placeholder="https://example.com/media" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {sourceType !== "wistia" && (
          <FormField
            control={form.control}
            name="embed_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Embed ID (optional)</FormLabel>
                <FormControl>
                  <InputShadow placeholder="Video embed ID" {...field} />
                </FormControl>
                <FormDescription>
                  For YouTube or Vimeo videos, this is extracted automatically.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {sourceType !== "wistia" && (
          <FormField
            control={form.control}
            name="thumbnail_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Thumbnail URL (optional)</FormLabel>
                <FormControl>
                  <InputShadow placeholder="https://example.com/thumbnail.jpg" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}


        <div className="flex items-center justify-end gap-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting} className="h-11 px-6 md:h-10 md:px-4">
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting} className="h-11 px-6 md:h-10 md:px-4">
            {isSubmitting ? "Saving..." : isEdit ? "Update Media" : "Create Media"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

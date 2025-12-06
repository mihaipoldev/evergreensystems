"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { InputShadow } from "@/components/admin/forms/InputShadow";
import { TextareaShadow } from "@/components/admin/forms/TextareaShadow";
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
import type { Section } from "../types";

const formSchema = z.object({
  type: z.string().min(1, "Type is required"),
  title: z.string().optional(),
  admin_title: z.string().optional(),
  subtitle: z.string().optional(),
  content: z.string().optional(),
  media_url: z.union([z.string().url("Must be a valid URL"), z.literal(""), z.null()]).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type SectionFormProps = {
  initialData?: Section | null;
  isEdit?: boolean;
};

// Common section types
const SECTION_TYPES = [
  "hero",
  "logos",
  "features",
  "testimonials",
  "faq",
  "cta",
  "results",
  "stories",
  "content",
  "gallery",
  "pricing",
  "contact",
  "about",
];

export function SectionForm({ initialData, isEdit = false }: SectionFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Parse content JSON if it exists
  const parseContent = (content: any): string => {
    if (!content) return "";
    if (typeof content === "string") return content;
    try {
      return JSON.stringify(content, null, 2);
    } catch {
      return "";
    }
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: initialData?.type || "",
      title: initialData?.title || "",
      admin_title: initialData?.admin_title || "",
      subtitle: initialData?.subtitle || "",
      content: parseContent(initialData?.content),
      media_url: initialData?.media_url || "",
    },
  });

  const sectionType = form.watch("type");

  // Clear media_url when type changes away from hero
  useEffect(() => {
    if (sectionType !== "hero") {
      form.setValue("media_url", "");
      setSelectedFile(null);
    }
  }, [sectionType, form]);

  const validateMediaUrl = async (url: string): Promise<{ valid: boolean; error?: string }> => {
    try {
      // For videos, we'll do a basic URL validation
      // The actual file validation will happen on upload
      try {
        new URL(url);
        return { valid: true };
      } catch {
        return { valid: false, error: "Invalid URL format" };
      }
    } catch (error: any) {
      return { valid: false, error: error.message || "Failed to validate media URL" };
    }
  };

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      // Parse content JSON if provided
      let parsedContent = null;
      if (values.content && values.content.trim()) {
        try {
          parsedContent = JSON.parse(values.content);
        } catch (e) {
          throw new Error("Invalid JSON in content field");
        }
      }

      let mediaUrl = values.media_url?.trim() || null;
      // Normalize existing URL to ensure it has protocol (only if not empty)
      if (mediaUrl && mediaUrl !== "" && !mediaUrl.startsWith("http://") && !mediaUrl.startsWith("https://")) {
        mediaUrl = `https://${mediaUrl}`;
      }
      // Ensure empty strings become null
      if (mediaUrl === "") {
        mediaUrl = null;
      }
      const oldMediaUrl = initialData?.media_url || null;

      // Handle file upload (only for hero sections)
      if (selectedFile && values.type === "hero") {
        const folderPath = isEdit && initialData
          ? `sections/${initialData.id}`
          : "sections/temp";

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
        // Ensure URL has protocol
        if (mediaUrl && !mediaUrl.startsWith("http://") && !mediaUrl.startsWith("https://")) {
          mediaUrl = `https://${mediaUrl}`;
        }

        // If this is a new section, the file is in temp folder
        // We'll move it after creating the section
      } else if (mediaUrl && mediaUrl !== oldMediaUrl && values.type === "hero") {
        // Validate URL if it's a new URL
        const validation = await validateMediaUrl(mediaUrl);
        if (!validation.valid) {
          throw new Error(validation.error || "Invalid media URL");
        }
      }

      // Only include media_url if type is hero
      const payload: any = {
        type: values.type,
        title: values.title || null,
        admin_title: values.admin_title || null,
        subtitle: values.subtitle || null,
        content: parsedContent,
      };

      if (values.type === "hero") {
        payload.media_url = mediaUrl;
      } else {
        // Clear media_url if type is not hero
        payload.media_url = null;
      }

      const url = isEdit && initialData
        ? `/api/admin/sections/${initialData.id}`
        : "/api/admin/sections";
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
        throw new Error(error.error || `Failed to ${isEdit ? "update" : "create"} section`);
      }

      const sectionData = await response.json();
      const sectionId = sectionData.id || initialData?.id;

      // Move file from temp to permanent folder if this was a new section
      if (selectedFile && !isEdit && mediaUrl && values.type === "hero") {
        const tempFolderPath = "sections/temp";
        const permanentFolderPath = `sections/${sectionId}`;

        // Extract filename from URL
        const urlParts = mediaUrl.split("/");
        const filename = urlParts[urlParts.length - 1];
        const tempPath = `${tempFolderPath}/${filename}`;

        // Move the file
        const moveResponse = await fetch("/api/admin/upload/move", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageUrl: mediaUrl,
            newFolderPath: `${permanentFolderPath}/${filename}`,
          }),
        });

        if (moveResponse.ok) {
          const moveData = await moveResponse.json();
          mediaUrl = moveData.url;
          // Ensure URL has protocol
          if (mediaUrl && !mediaUrl.startsWith("http://") && !mediaUrl.startsWith("https://")) {
            mediaUrl = `https://${mediaUrl}`;
          }

          // Update section with new URL
          if (sectionId) {
            await fetch(`/api/admin/sections/${sectionId}`, {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
              },
              body: JSON.stringify({ media_url: mediaUrl }),
            });
          }
        }
      }

      toast.success(`Section ${isEdit ? "updated" : "created"} successfully`);
      router.push("/admin/sections");
      router.refresh();
    } catch (error: any) {
      console.error("Error saving section:", error);
      toast.error(error.message || `Failed to ${isEdit ? "update" : "create"} section`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
        <div className="rounded-xl bg-card text-card-foreground shadow-lg p-6 md:p-8 space-y-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-1">Details</h3>
              <p className="text-sm text-muted-foreground">
                Basic information about the section
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="admin_title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Admin Title</FormLabel>
                  <FormControl>
                    <InputShadow placeholder="Enter admin title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Type <span className="text-destructive">*</span>
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-input-background">
                        <SelectValue placeholder="Select section type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {SECTION_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </SelectItem>
                      ))}
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <InputShadow placeholder="Enter section title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="subtitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subtitle</FormLabel>
                <FormControl>
                  <TextareaShadow
                    placeholder="Enter section subtitle"
                    className="min-h-[150px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Content (JSON)</FormLabel>
                <FormControl>
                  <TextareaShadow
                    placeholder='Enter JSON content, e.g., {"key": "value"}'
                    className="font-mono text-sm resize-y"
                    style={{ minHeight: '140px' }}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Optional JSON content for the section. Must be valid JSON format.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="media_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Media URL {sectionType !== "hero" && <span className="text-muted-foreground text-sm font-normal">(Hero sections only)</span>}</FormLabel>
                <FormControl>
                  <div className={sectionType !== "hero" ? "opacity-50 pointer-events-none" : ""}>
                    <VideoUploadField
                      value={sectionType === "hero" ? (field.value || null) : null}
                      onChange={(url) => {
                        if (sectionType === "hero") {
                          field.onChange(url || "");
                        }
                      }}
                      onFileChange={(file) => {
                        if (sectionType === "hero") {
                          setSelectedFile(file);
                        }
                      }}
                      folderPath={isEdit && initialData ? `sections/${initialData.id}` : "sections/temp"}
                      error={form.formState.errors.media_url?.message}
                      placeholder="https://example.com/video.mp4"
                    />
                  </div>
                </FormControl>
                <FormDescription>
                  {sectionType === "hero" 
                    ? "Upload or enter a URL for video media (Hero sections only)"
                    : "Media URL is only available for Hero sections"}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex items-center justify-end gap-4 mt-6">
          <Button
            type="button"
            variant="outline"
            className="bg-card hover:bg-card/80"
            asChild
            disabled={isSubmitting}
          >
            <Link href="/admin/sections">Cancel</Link>
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : isEdit ? "Update Section" : "Create Section"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

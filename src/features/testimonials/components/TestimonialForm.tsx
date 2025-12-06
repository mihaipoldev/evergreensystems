"use client";

import { useState } from "react";
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ImageUploadField } from "@/components/admin/forms/ImageUploadField";
import { RatingSelect } from "@/components/admin/forms/RatingSelect";
import type { Testimonial } from "../types";

const formSchema = z.object({
  author_name: z.string().min(1, "Author name is required"),
  author_role: z.string().optional(),
  company_name: z.string().optional(),
  headline: z.string().optional(),
  quote: z.string().optional(),
  avatar_url: z.union([z.string().url("Must be a valid URL"), z.literal(""), z.null()]).optional(),
  rating: z.number().min(1).max(5).nullable().optional(),
  approved: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

type TestimonialFormProps = {
  initialData?: Testimonial | null;
  isEdit?: boolean;
  rightSideHeaderContent?: React.ReactNode;
};

export function TestimonialForm({ initialData, isEdit = false, rightSideHeaderContent }: TestimonialFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      author_name: initialData?.author_name || "",
      author_role: initialData?.author_role || "",
      company_name: initialData?.company_name || "",
      headline: initialData?.headline || "",
      quote: initialData?.quote || "",
      avatar_url: initialData?.avatar_url || "",
      rating: initialData?.rating ?? null,
      approved: initialData?.approved ?? false,
    },
  });

  const validateImageUrl = async (url: string): Promise<{ valid: boolean; error?: string }> => {
    try {
      const response = await fetch("/api/admin/upload/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: url }),
      });
      const data = await response.json();
      return { valid: data.valid || false, error: data.error };
    } catch (error: any) {
      return { valid: false, error: error.message || "Failed to validate image" };
    }
  };

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      let avatarUrl = values.avatar_url?.trim() || null;
      // Normalize existing URL to ensure it has protocol (only if not empty)
      if (avatarUrl && avatarUrl !== "" && !avatarUrl.startsWith("http://") && !avatarUrl.startsWith("https://")) {
        avatarUrl = `https://${avatarUrl}`;
      }
      // Ensure empty strings become null
      if (avatarUrl === "") {
        avatarUrl = null;
      }
      const oldAvatarUrl = initialData?.avatar_url || null;

      // Handle file upload
      if (selectedFile) {
        const folderPath = isEdit && initialData
          ? `testimonials/${initialData.id}`
          : "testimonials/temp";

        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("folderPath", folderPath);

        const uploadResponse = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadResponse.ok) {
          const error = await uploadResponse.json();
          throw new Error(error.error || "Failed to upload image");
        }

        const uploadData = await uploadResponse.json();
        avatarUrl = uploadData.url;
        // Ensure URL has protocol
        if (avatarUrl && !avatarUrl.startsWith("http://") && !avatarUrl.startsWith("https://")) {
          avatarUrl = `https://${avatarUrl}`;
        }

        // If this is a new testimonial, the file is in temp folder
        // We'll move it after creating the testimonial
      } else if (avatarUrl && avatarUrl !== oldAvatarUrl) {
        // Validate URL if it's a new URL
        const validation = await validateImageUrl(avatarUrl);
        if (!validation.valid) {
          throw new Error(validation.error || "Invalid image URL");
        }
      }

      // Save testimonial
      const url = isEdit && initialData
        ? `/api/admin/testimonials/${initialData.id}`
        : "/api/admin/testimonials";
      const method = isEdit ? "PUT" : "POST";

      const payload = {
        ...values,
        author_role: values.author_role || null,
        company_name: values.company_name || null,
        headline: values.headline || null,
        quote: values.quote || null,
        avatar_url: avatarUrl,
        rating: values.rating ?? null,
      };

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
        throw new Error(error.error || `Failed to ${isEdit ? "update" : "create"} testimonial`);
      }

      const testimonialData = await response.json();
      const testimonialId = testimonialData.id || initialData?.id;

      // Move file from temp to permanent folder if this was a new testimonial
      if (selectedFile && !isEdit && avatarUrl) {
        const tempFolderPath = "testimonials/temp";
        const permanentFolderPath = `testimonials/${testimonialId}`;

        // Extract filename from URL
        const urlParts = avatarUrl.split("/");
        const filename = urlParts[urlParts.length - 1];
        const tempPath = `${tempFolderPath}/${filename}`;

        // Move the file
        const moveResponse = await fetch("/api/admin/upload/move", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageUrl: avatarUrl,
            newFolderPath: `${permanentFolderPath}/${filename}`,
          }),
        });

        if (moveResponse.ok) {
          const moveData = await moveResponse.json();
          avatarUrl = moveData.url;
          // Ensure URL has protocol
          if (avatarUrl && !avatarUrl.startsWith("http://") && !avatarUrl.startsWith("https://")) {
            avatarUrl = `https://${avatarUrl}`;
          }

          // Update testimonial with new URL
          if (testimonialId) {
            await fetch(`/api/admin/testimonials/${testimonialId}`, {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
              },
              body: JSON.stringify({ avatar_url: avatarUrl }),
            });
          }
        }
      }

      // Note: Moving old avatar to bin is now handled automatically by the PUT route
      // No need to do it here to avoid duplicate operations

      toast.success(`Testimonial ${isEdit ? "updated" : "created"} successfully`);
      router.push("/admin/testimonials");
      router.refresh();
    } catch (error: any) {
      console.error("Error saving testimonial:", error);
      toast.error(error.message || `Failed to ${isEdit ? "update" : "create"} testimonial`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <div className="w-full space-y-6">
        {rightSideHeaderContent}
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
        <div className="rounded-xl bg-card text-card-foreground shadow-lg p-6 md:p-8 space-y-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-1">Details</h3>
              <p className="text-sm text-muted-foreground">
                Basic information about the testimonial
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="author_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Author Name <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <InputShadow placeholder="Enter author name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="author_role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Author Role</FormLabel>
                  <FormControl>
                    <InputShadow placeholder="e.g., CEO, Marketing Director" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="company_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company Name</FormLabel>
                <FormControl>
                  <InputShadow placeholder="Enter company name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rating</FormLabel>
                  <FormControl>
                    <RatingSelect
                      value={field.value ?? null}
                      onChange={field.onChange}
                      error={form.formState.errors.rating?.message}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="headline"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Headline</FormLabel>
                <FormControl>
                  <InputShadow placeholder="Enter testimonial headline" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="quote"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Body</FormLabel>
                <FormControl>
                  <TextareaShadow
                    placeholder="Enter the testimonial quote"
                    style={{ minHeight: "120px" }}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="avatar_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Avatar Image</FormLabel>
                <FormControl>
                  <ImageUploadField
                    value={field.value || null}
                    onChange={(url) => field.onChange(url || "")}
                    onFileChange={(file) => setSelectedFile(file)}
                    folderPath={isEdit && initialData ? `testimonials/${initialData.id}` : "testimonials/temp"}
                    error={form.formState.errors.avatar_url?.message}
                    placeholder="https://example.com/avatar.jpg"
                  />
                </FormControl>
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
            <Link href="/admin/testimonials">Cancel</Link>
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : isEdit ? "Update Testimonial" : "Create Testimonial"}
          </Button>
        </div>
        </form>
      </div>
    </Form>
  );
}

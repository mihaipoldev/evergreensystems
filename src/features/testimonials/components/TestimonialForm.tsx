"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useIsMobile } from "@/hooks/use-mobile";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useCreateTestimonial, useUpdateTestimonial } from "@/lib/react-query/hooks";
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
});

type FormValues = z.infer<typeof formSchema>;

type TestimonialFormProps = {
  initialData?: Testimonial | null;
  isEdit?: boolean;
  rightSideHeaderContent?: React.ReactNode;
  returnTo?: string;
};

export function TestimonialForm({ initialData, isEdit = false, rightSideHeaderContent, returnTo }: TestimonialFormProps) {
  const router = useRouter();
  const isMobile = useIsMobile();
  const createTestimonial = useCreateTestimonial();
  const updateTestimonial = useUpdateTestimonial();
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

      // Save testimonial using React Query mutation
      const payload = {
        ...values,
        author_role: values.author_role || null,
        company_name: values.company_name || null,
        headline: values.headline || null,
        quote: values.quote || null,
        avatar_url: avatarUrl,
        rating: values.rating ?? null,
      };

      let testimonialData;
      if (isEdit && initialData) {
        testimonialData = await updateTestimonial.mutateAsync({
          id: initialData.id,
          data: payload,
        });
      } else {
        const createPayload = {
          ...payload,
          author_role: payload.author_role ?? undefined,
          company_name: payload.company_name ?? undefined,
          headline: payload.headline ?? undefined,
          quote: payload.quote ?? undefined,
          avatar_url: payload.avatar_url ?? undefined,
          rating: payload.rating ?? undefined,
        };
        testimonialData = await createTestimonial.mutateAsync(createPayload);
      }

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

          // Update testimonial with new URL using React Query
          if (testimonialId) {
            await updateTestimonial.mutateAsync({
              id: testimonialId,
              data: { avatar_url: avatarUrl },
            });
          }
        }
      }

      // Note: Moving old avatar to bin is now handled automatically by the PUT route
      // No need to do it here to avoid duplicate operations

      toast.success(`Testimonial ${isEdit ? "updated" : "created"} successfully`);
      const redirectUrl = returnTo || (isEdit && initialData ? `/admin/testimonials/${initialData.id}/edit` : "/admin/testimonials");
      router.push(redirectUrl);
      router.refresh();
    } catch (error: any) {
      console.error("Error saving testimonial:", error);
      toast.error(error.message || `Failed to ${isEdit ? "update" : "create"} testimonial`);
    }
  };

  const isSubmitting = createTestimonial.isPending || updateTestimonial.isPending;

  return (
    <Form {...form}>
      <div className="w-full space-y-6">
        {rightSideHeaderContent}
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
        <div className="rounded-xl bg-card text-card-foreground shadow-lg p-6 md:p-8 space-y-6">
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
                    style={{ minHeight: isMobile ? '200px' : '120px' }}
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
            className="bg-card hover:bg-card/80 h-11 px-6 md:h-10 md:px-4"
            asChild
            disabled={isSubmitting}
          >
            <Link href="/admin/testimonials">Cancel</Link>
          </Button>
          <Button type="submit" disabled={isSubmitting} className="h-11 px-6 md:h-10 md:px-4">
            {isSubmitting ? "Saving..." : isEdit ? "Update Testimonial" : "Create Testimonial"}
          </Button>
        </div>
        </form>
      </div>
    </Form>
  );
}

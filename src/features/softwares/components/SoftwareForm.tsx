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
import { ImageUploadField } from "@/components/admin/forms/ImageUploadField";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import type { Software } from "../types";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
  website_url: z.string().min(1, "Website URL is required").url("Must be a valid URL"),
  icon: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

type SoftwareFormProps = {
  initialData?: Software | null;
  isEdit?: boolean;
  returnTo?: string;
};

export function SoftwareForm({ initialData, isEdit = false, returnTo }: SoftwareFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedIconFile, setSelectedIconFile] = useState<File | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      slug: initialData?.slug || "",
      website_url: initialData?.website_url || "",
      icon: initialData?.icon || "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      // Handle icon file upload
      let iconUrl = values.icon || "";
      if (selectedIconFile) {
        const folderPath = isEdit && initialData
          ? `softwares/${initialData.id}`
          : "softwares/temp";

        const formData = new FormData();
        formData.append("file", selectedIconFile);
        formData.append("folderPath", folderPath);

        const uploadResponse = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadResponse.ok) {
          const error = await uploadResponse.json();
          throw new Error(error.error || "Failed to upload icon");
        }

        const uploadData = await uploadResponse.json();
        iconUrl = uploadData.url;
        if (iconUrl && !iconUrl.startsWith("http://") && !iconUrl.startsWith("https://")) {
          iconUrl = `https://${iconUrl}`;
        }
      }

      const url = isEdit && initialData
        ? `/api/admin/softwares/${initialData.id}`
        : "/api/admin/softwares";
      const method = isEdit ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({
          name: values.name,
          slug: values.slug,
          website_url: values.website_url,
          icon: iconUrl || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Failed to ${isEdit ? "update" : "create"} software`);
      }

      toast.success(`Software ${isEdit ? "updated" : "created"} successfully`);
      const redirectUrl = returnTo || "/admin/softwares";
      router.push(redirectUrl);
      router.refresh();
    } catch (error: any) {
      console.error("Error saving software:", error);
      toast.error(error.message || `Failed to ${isEdit ? "update" : "create"} software`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
        <div className="rounded-xl bg-card text-card-foreground shadow-lg p-6 md:p-8 space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Name <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <InputShadow
                    placeholder="e.g., React, Next.js, TypeScript"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Slug <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <InputShadow
                    placeholder="e.g., react, nextjs, typescript"
                    {...field}
                  />
                </FormControl>
                <p className="text-xs text-muted-foreground mt-1">
                  Lowercase letters, numbers, and hyphens only
                </p>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="website_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Website URL <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <InputShadow
                    placeholder="https://react.dev/"
                    type="url"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="icon"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Icon</FormLabel>
                <FormControl>
                  <ImageUploadField
                    value={field.value || null}
                    onChange={(url) => field.onChange(url || "")}
                    onFileChange={setSelectedIconFile}
                    folderPath={isEdit && initialData ? `softwares/${initialData.id}` : "softwares/temp"}
                    error={form.formState.errors.icon?.message}
                    placeholder="https://example.com/icon.svg"
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
            <Link href={returnTo || "/admin/softwares"}>Cancel</Link>
          </Button>
          <Button type="submit" disabled={isSubmitting} className="h-11 px-6 md:h-10 md:px-4">
            {isSubmitting ? "Saving..." : isEdit ? "Update Software" : "Create Software"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

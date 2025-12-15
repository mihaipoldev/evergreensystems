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
import type { SocialPlatform } from "../types";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  icon: z.string().optional(),
  base_url: z.string().min(1, "Base URL is required").url("Must be a valid URL"),
});

type FormValues = z.infer<typeof formSchema>;

type SocialPlatformFormProps = {
  initialData?: SocialPlatform | null;
  isEdit?: boolean;
  returnTo?: string;
};

export function SocialPlatformForm({ initialData, isEdit = false, returnTo }: SocialPlatformFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedIconFile, setSelectedIconFile] = useState<File | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      icon: initialData?.icon || "",
      base_url: initialData?.base_url || "",
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
          ? `social-platforms/${initialData.id}`
          : "social-platforms/temp";

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
        ? `/api/admin/social-platforms/${initialData.id}`
        : "/api/admin/social-platforms";
      const method = isEdit ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({
          name: values.name,
          icon: iconUrl || null,
          base_url: values.base_url,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Failed to ${isEdit ? "update" : "create"} social platform`);
      }

      toast.success(`Social platform ${isEdit ? "updated" : "created"} successfully`);
      const redirectUrl = returnTo || "/admin/social-platforms";
      router.push(redirectUrl);
      router.refresh();
    } catch (error: any) {
      console.error("Error saving social platform:", error);
      toast.error(error.message || `Failed to ${isEdit ? "update" : "create"} social platform`);
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
                    placeholder="e.g., Twitter, GitHub, LinkedIn"
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
                    folderPath={isEdit && initialData ? `social-platforms/${initialData.id}` : "social-platforms/temp"}
                    error={form.formState.errors.icon?.message}
                    placeholder="https://example.com/icon.svg"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="base_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Base URL <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <InputShadow
                    placeholder="https://twitter.com/"
                    type="url"
                    {...field}
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
            <Link href={returnTo || "/admin/social-platforms"}>Cancel</Link>
          </Button>
          <Button type="submit" disabled={isSubmitting} className="h-11 px-6 md:h-10 md:px-4">
            {isSubmitting ? "Saving..." : isEdit ? "Update Social Platform" : "Create Social Platform"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

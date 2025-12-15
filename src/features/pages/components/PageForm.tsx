"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useCreatePage, useUpdatePage } from "@/lib/react-query/hooks";
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
import type { Page } from "../types";

const formSchema = z.object({
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

type PageFormProps = {
  initialData?: Page | null;
  isEdit?: boolean;
};


export function PageForm({ initialData, isEdit = false }: PageFormProps) {
  const router = useRouter();
  const createPage = useCreatePage();
  const updatePage = useUpdatePage();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      slug: initialData?.slug || "",
      title: initialData?.title || "",
      description: initialData?.description || "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      // Use React Query mutation
      if (isEdit && initialData) {
        await updatePage.mutateAsync({
          id: initialData.id,
          data: values,
        });
      } else {
        await createPage.mutateAsync(values);
      }


      toast.success(`Page ${isEdit ? "updated" : "created"} successfully`);
      router.push("/admin/pages");
      router.refresh();
    } catch (error: any) {
      console.error("Error saving page:", error);
      toast.error(error.message || `Failed to ${isEdit ? "update" : "create"} page`);
    }
  };

  const isSubmitting = createPage.isPending || updatePage.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
        <div className="rounded-xl bg-card text-card-foreground shadow-lg p-6 md:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Title <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <InputShadow placeholder="Enter page title" {...field} />
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
                    <InputShadow placeholder="my-page-slug" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <TextareaShadow
                    placeholder="Enter page description"
                    style={{ minHeight: '100px' }}
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
            <Link href="/admin/pages">Cancel</Link>
          </Button>
          <Button type="submit" disabled={isSubmitting} className="h-11 px-6 md:h-10 md:px-4">
            {isSubmitting ? "Saving..." : isEdit ? "Update Page" : "Create Page"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

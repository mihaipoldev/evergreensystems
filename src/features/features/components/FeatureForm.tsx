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
import type { OfferFeature } from "../types";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  icon: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

type FeatureFormProps = {
  initialData?: OfferFeature | null;
  isEdit?: boolean;
};

export function FeatureForm({ initialData, isEdit = false }: FeatureFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.title || "",
      subtitle: initialData?.subtitle || "",
      description: initialData?.description || "",
      icon: initialData?.icon || "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      const url = isEdit && initialData
        ? `/api/admin/offer-features/${initialData.id}`
        : "/api/admin/offer-features";
      const method = isEdit ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Failed to ${isEdit ? "update" : "create"} feature`);
      }

      toast.success(`Feature ${isEdit ? "updated" : "created"} successfully`);
      router.push("/admin/features");
      router.refresh();
    } catch (error: any) {
      console.error("Error saving feature:", error);
      toast.error(error.message || `Failed to ${isEdit ? "update" : "create"} feature`);
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
                Basic information about the feature
              </p>
            </div>
          </div>

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
                    <InputShadow placeholder="Enter feature title" {...field} />
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
                    <InputShadow placeholder="Icon name or emoji" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="subtitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subtitle</FormLabel>
                <FormControl>
                  <InputShadow placeholder="Enter feature subtitle" {...field} />
                </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <TextareaShadow
                      placeholder="Enter feature description"
                      className="min-h-[100px]"
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
            className="bg-card hover:bg-card/80"
            asChild
            disabled={isSubmitting}
          >
            <Link href="/admin/features">Cancel</Link>
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : isEdit ? "Update Feature" : "Create Feature"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

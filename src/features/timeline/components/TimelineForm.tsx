"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { IconPickerField } from "@/components/admin/forms/IconPickerField";
import type { Timeline } from "../types";

const formSchema = z.object({
  step: z.coerce.number().int().positive("Step must be a positive number"),
  title: z.string().min(1, "Title is required"),
  subtitle: z.string().optional(),
  badge: z.string().optional(),
  icon: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

type TimelineFormProps = {
  initialData?: Timeline;
  isEdit?: boolean;
  onSuccess?: (data: Timeline) => void;
  onCancel?: () => void;
};

export function TimelineForm({ initialData, isEdit = false, onSuccess, onCancel }: TimelineFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      step: initialData?.step ?? 1,
      title: initialData?.title ?? "",
      subtitle: initialData?.subtitle ?? "",
      badge: initialData?.badge ?? "",
      icon: initialData?.icon ?? "",
    },
  });

  async function onSubmit(values: FormValues) {
    try {
      const url = isEdit && initialData?.id
        ? `/api/admin/timeline/${initialData.id}`
        : "/api/admin/timeline";
      
      const method = isEdit ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Failed to ${isEdit ? "update" : "create"} timeline item`);
      }

      const data = await response.json();
      onSuccess?.(data);
    } catch (error: any) {
      console.error("Error saving timeline item:", error);
      form.setError("root", {
        message: error.message || `Failed to ${isEdit ? "update" : "create"} timeline item`,
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {form.formState.errors.root && (
          <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md text-sm">
            {form.formState.errors.root.message}
          </div>
        )}

        <FormField
          control={form.control}
          name="step"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Step Number</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="1"
                  placeholder="1"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                The step number in the timeline sequence.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter timeline title..."
                  {...field}
                />
              </FormControl>
              <FormDescription>
                The main title for this timeline step.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="subtitle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subtitle (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter subtitle or description..."
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Additional details or description for this step.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="badge"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Badge (Optional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., Week 1, Phase 1, Complete"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                A small label or badge to display with this step.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="icon"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Icon (Optional)</FormLabel>
              <FormControl>
                <IconPickerField
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Icon name or click to browse"
                />
              </FormControl>
              <FormDescription>
                Choose an icon to represent this timeline step.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting
              ? (isEdit ? "Updating..." : "Creating...")
              : (isEdit ? "Update Timeline Item" : "Create Timeline Item")}
          </Button>
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={form.formState.isSubmitting}
            >
              Cancel
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}

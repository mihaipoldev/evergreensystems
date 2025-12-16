"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faListOl } from "@fortawesome/free-solid-svg-icons";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { IconPickerButton } from "@/components/admin/forms/IconPickerButton";
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
  returnTo?: string;
};

export function TimelineForm({ initialData, isEdit = false, onSuccess, onCancel, returnTo }: TimelineFormProps) {
  const router = useRouter();
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
      toast.success(`Timeline item ${isEdit ? "updated" : "created"} successfully`);
      
      // If returnTo is provided, navigate there; otherwise use onSuccess callback
      if (returnTo) {
        router.push(returnTo);
        router.refresh();
      } else {
        onSuccess?.(data);
      }
    } catch (error: any) {
      console.error("Error saving timeline item:", error);
      toast.error(error.message || `Failed to ${isEdit ? "update" : "create"} timeline item`);
      form.setError("root", {
        message: error.message || `Failed to ${isEdit ? "update" : "create"} timeline item`,
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
        <div className="rounded-xl bg-card text-card-foreground shadow-lg p-6 md:p-8">
          {form.formState.errors.root && (
            <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md text-sm mb-6">
              {form.formState.errors.root.message}
            </div>
          )}

          {/* Basic Information Section */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-primary/10 border border-primary/20 w-9 h-9 flex items-center justify-center">
                  <FontAwesomeIcon icon={faListOl} className="h-4 w-4 text-primary" />
                </div>
                <div className="font-medium text-lg">Basic Information</div>
              </div>
              <div className="text-sm text-muted-foreground">Timeline details</div>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        <IconPickerButton
                          value={field.value || ""}
                          onChange={field.onChange}
                        />
                      </FormControl>
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
                      <Input
                        placeholder="Enter timeline title..."
                        {...field}
                      />
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
                    <FormLabel>Subtitle (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter subtitle or description..."
                        rows={3}
                        {...field}
                      />
                    </FormControl>
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
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-4 mt-6">
          {(returnTo || onCancel) && (
            <Button
              type="button"
              variant="outline"
              className="bg-card hover:bg-card/80 h-11 px-6 md:h-10 md:px-4"
              onClick={() => {
                if (returnTo) {
                  router.push(returnTo);
                } else {
                  onCancel?.();
                }
              }}
              disabled={form.formState.isSubmitting}
            >
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={form.formState.isSubmitting} className="h-11 px-6 md:h-10 md:px-4">
            {form.formState.isSubmitting
              ? (isEdit ? "Updating..." : "Creating...")
              : (isEdit ? "Update Timeline" : "Create Timeline")}
          </Button>
        </div>
      </form>
    </Form>
  );
}

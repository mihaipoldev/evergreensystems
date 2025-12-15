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
import { Textarea } from "@/components/ui/textarea";
import type { Result } from "../types";

const formSchema = z.object({
  content: z.string().min(1, "Content is required").refine(
    (val) => {
      try {
        JSON.parse(val);
        return true;
      } catch {
        return false;
      }
    },
    { message: "Content must be valid JSON" }
  ),
});

type FormValues = z.infer<typeof formSchema>;

type ResultFormProps = {
  initialData?: Result;
  isEdit?: boolean;
  onSuccess?: (data: Result) => void;
  onCancel?: () => void;
};

export function ResultForm({ initialData, isEdit = false, onSuccess, onCancel }: ResultFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: initialData?.content ? JSON.stringify(initialData.content, null, 2) : "",
    },
  });

  async function onSubmit(values: FormValues) {
    try {
      const url = isEdit && initialData?.id
        ? `/api/admin/results/${initialData.id}`
        : "/api/admin/results";
      
      const method = isEdit ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: JSON.parse(values.content),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Failed to ${isEdit ? "update" : "create"} result`);
      }

      const data = await response.json();
      onSuccess?.(data);
    } catch (error: any) {
      console.error("Error saving result:", error);
      form.setError("root", {
        message: error.message || `Failed to ${isEdit ? "update" : "create"} result`,
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
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content (JSON)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder='{"title": "100+", "subtitle": "Happy Clients", "icon": "fa-users"}'
                  rows={12}
                  className="font-mono text-sm"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Enter the content as valid JSON. Example: {`{"title": "100+", "subtitle": "Happy Clients", "icon": "fa-users"}`}
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
              : (isEdit ? "Update Result" : "Create Result")}
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

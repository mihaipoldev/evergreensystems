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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCode } from "@fortawesome/free-solid-svg-icons";
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
  returnTo?: string;
};

export function ResultForm({ initialData, isEdit = false, onSuccess, onCancel, returnTo }: ResultFormProps) {
  const router = useRouter();
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
      toast.success(`Result ${isEdit ? "updated" : "created"} successfully`);
      
      // If returnTo is provided, navigate there; otherwise use onSuccess callback
      if (returnTo) {
        router.push(returnTo);
        router.refresh();
      } else {
        onSuccess?.(data);
      }
    } catch (error: any) {
      console.error("Error saving result:", error);
      toast.error(error.message || `Failed to ${isEdit ? "update" : "create"} result`);
      form.setError("root", {
        message: error.message || `Failed to ${isEdit ? "update" : "create"} result`,
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

          {/* Content Section */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-primary/10 border border-primary/20 w-9 h-9 flex items-center justify-center">
                  <FontAwesomeIcon icon={faCode} className="h-4 w-4 text-primary" />
                </div>
                <div className="font-medium text-lg">Content (JSON)</div>
              </div>
              <div className="text-sm text-muted-foreground">Result content</div>
            </div>

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
              : (isEdit ? "Update Result" : "Create Result")}
          </Button>
        </div>
      </form>
    </Form>
  );
}

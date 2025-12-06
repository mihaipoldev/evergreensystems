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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CTAButton } from "../types";

const formSchema = z.object({
  label: z.string().min(1, "Label is required"),
  url: z.string().min(1, "URL is required").url("Must be a valid URL"),
  style: z.string().optional(),
  icon: z.string().optional(),
  status: z.enum(["active", "deactivated"]),
});

type FormValues = z.infer<typeof formSchema>;

type CTAButtonFormProps = {
  initialData?: CTAButton | null;
  isEdit?: boolean;
  rightSideHeaderContent?: React.ReactNode;
  onSuccess?: (ctaButton: CTAButton) => void;
  onCancel?: () => void;
};

export function CTAButtonForm({ initialData, isEdit = false, rightSideHeaderContent, onSuccess, onCancel }: CTAButtonFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      label: initialData?.label || "",
      url: initialData?.url || "",
      style: initialData?.style || "",
      icon: initialData?.icon || "",
      status: initialData?.status || "active",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      const payload = {
        label: values.label,
        url: values.url,
        style: values.style || null,
        icon: values.icon || null,
        status: values.status,
      };

      const url = isEdit && initialData
        ? `/api/admin/cta-buttons/${initialData.id}`
        : "/api/admin/cta-buttons";
      const method = isEdit ? "PUT" : "POST";

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
        throw new Error(error.error || `Failed to ${isEdit ? "update" : "create"} CTA button`);
      }

      const createdCTA = await response.json();
      toast.success(`CTA button ${isEdit ? "updated" : "created"} successfully`);
      
      if (onSuccess) {
        onSuccess(createdCTA);
      } else {
        router.push("/admin/cta");
        router.refresh();
      }
    } catch (error: any) {
      console.error("Error saving CTA button:", error);
      toast.error(error.message || `Failed to ${isEdit ? "update" : "create"} CTA button`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <div className="w-full space-y-6">
        {rightSideHeaderContent}
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6">
          {!onSuccess && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-1">Details</h3>
                <p className="text-sm text-muted-foreground">
                  Basic information about the CTA button
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="label"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Label <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <InputShadow placeholder="Enter button label" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      URL <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <InputShadow placeholder="https://example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="style"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Style</FormLabel>
                    <FormControl>
                      <InputShadow placeholder="e.g., primary, secondary" {...field} />
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
                      <InputShadow placeholder="Font Awesome icon name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Status <span className="text-destructive">*</span>
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-input-background">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="deactivated">Deactivated</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          <div className="flex items-center justify-end gap-4">
            {onCancel ? (
              <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
                Cancel
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                className="bg-card hover:bg-card/80"
                asChild
                disabled={isSubmitting}
              >
                <Link href="/admin/cta">Cancel</Link>
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : isEdit ? "Update CTA Button" : "Create CTA Button"}
            </Button>
          </div>
        </form>
      </div>
    </Form>
  );
}

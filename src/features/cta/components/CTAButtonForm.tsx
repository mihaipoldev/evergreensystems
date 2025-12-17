"use client";

import { useEffect, useMemo, useState } from "react";
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
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeading } from "@fortawesome/free-solid-svg-icons";
import { IconPickerButton } from "@/components/admin/forms/IconPickerButton";
import type { CTAButton } from "../types";
type SectionOption = { id: string; label: string };

const formSchema = z.object({
  label: z.string().min(1, "Label is required"),
  url: z.string().min(1, "URL is required").url("Must be a valid URL"),
  subtitle: z.string().optional(),
  style: z.string().optional(),
  icon: z.string().optional(),
  section_id: z.string().optional().nullable(),
});

type FormValues = z.infer<typeof formSchema>;

type CTAButtonFormProps = {
  initialData?: CTAButton | null;
  isEdit?: boolean;
  rightSideHeaderContent?: React.ReactNode;
  onSuccess?: (ctaButton: CTAButton) => void;
  onCancel?: () => void;
  returnTo?: string;
};


export function CTAButtonForm({ initialData, isEdit = false, rightSideHeaderContent, onSuccess, onCancel, returnTo }: CTAButtonFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      label: initialData?.label || "",
      url: initialData?.url || "",
      subtitle: initialData?.subtitle || "",
      style: initialData?.style || "",
      icon: initialData?.icon || "",
      section_id: (initialData as any)?.section_id || null,
    },
  });

  const [sectionOptions, setSectionOptions] = useState<SectionOption[]>([]);
  const [isLoadingSections, setIsLoadingSections] = useState(false);

  // Load sections for selection
  useEffect(() => {
    const loadSections = async () => {
      try {
        setIsLoadingSections(true);
        const supabase = createClient();
        const { data: sessionData } = await supabase.auth.getSession();
        const accessToken = sessionData?.session?.access_token;

        const response = await fetch("/api/admin/sections/select", {
          headers: {
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          },
        });

        if (response.ok) {
          const data = await response.json();
          const options: SectionOption[] = (data || []).map((section: any) => ({
            id: section.id,
            label: section.admin_title || section.title || section.type || "Untitled section",
          }));
          setSectionOptions(options);
        }
      } catch (error) {
        console.error("Error loading sections for CTA form:", error);
      } finally {
        setIsLoadingSections(false);
      }
    };

    loadSections();
  }, []);

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      const payload = {
        label: values.label,
        url: values.url,
        subtitle: values.subtitle || null,
        style: values.style || null,
        icon: values.icon || null,
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

      // Link to section (single) if provided - ONLY on creation, not on edit
      // When editing, preserve existing section connections
      if (!isEdit) {
        try {
          const sectionId = values.section_id || null;
          await fetch(`/api/admin/cta-buttons/${createdCTA.id}/section`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
            },
            body: JSON.stringify({ section_id: sectionId }),
          });
        } catch (err) {
          console.warn("CTA section link update failed:", err);
        }
      }
      toast.success(`CTA button ${isEdit ? "updated" : "created"} successfully`);
      
      if (onSuccess) {
        onSuccess(createdCTA);
      } else {
        const redirectUrl = returnTo || (isEdit && initialData ? `/admin/cta/${initialData.id}/edit` : "/admin/cta");
        router.push(redirectUrl);
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
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
          <div className="rounded-xl bg-card text-card-foreground shadow-lg p-6 md:p-8">
            {/* Website Content Section */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-primary/10 border border-primary/20 w-9 h-9 flex items-center justify-center">
                    <FontAwesomeIcon icon={faHeading} className="h-4 w-4 text-primary" />
                  </div>
                  <div className="font-medium text-lg">Website Content</div>
                </div>
                <div className="text-sm text-muted-foreground">Public-facing content</div>
              </div>

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
                  name="subtitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subtitle</FormLabel>
                      <FormControl>
                        <InputShadow placeholder="Enter button subtitle" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <FormField
                  control={form.control}
                  name="style"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Style</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger className="bg-input-background">
                            <SelectValue placeholder="Select style" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="primary">Primary</SelectItem>
                          <SelectItem value="secondary">Secondary</SelectItem>
                        </SelectContent>
                      </Select>
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
            </div>
          </div>
          <div className="flex items-center justify-end gap-4 mt-6">
            {onCancel ? (
              <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting} className="h-11 px-6 md:h-10 md:px-4">
                Cancel
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                className="bg-card hover:bg-card/80 h-11 px-6 md:h-10 md:px-4"
                asChild
                disabled={isSubmitting}
              >
                <Link href={returnTo || "/admin/cta"}>Cancel</Link>
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting} className="h-11 px-6 md:h-10 md:px-4">
              {isSubmitting ? "Saving..." : isEdit ? "Update CTA Button" : "Create CTA Button"}
            </Button>
          </div>
        </form>
      </div>
    </Form>
  );
}

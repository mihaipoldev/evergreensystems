"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useIsMobile } from "@/hooks/use-mobile";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { InputShadow } from "@/components/admin/forms/InputShadow";
import { TextareaShadow } from "@/components/admin/forms/TextareaShadow";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGear, faHeading } from "@fortawesome/free-solid-svg-icons";
import { IconPickerButton } from "@/components/admin/forms/IconPickerButton";
import type { OfferFeature } from "../types";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  subtitle: z.string().optional(),
  icon: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

type FeatureFormProps = {
  initialData?: OfferFeature | null;
  isEdit?: boolean;
  returnTo?: string;
  sectionId?: string;
};


export function FeatureForm({ initialData, isEdit = false, returnTo, sectionId }: FeatureFormProps) {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.title || "",
      subtitle: initialData?.subtitle || "",
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

      const createdFeature = await response.json();
      
      // If sectionId is provided and this is a new feature, automatically add it to the section
      if (!isEdit && sectionId && createdFeature?.id) {
        try {
          // Get current max position for this section
          const maxPositionResponse = await fetch(`/api/admin/sections/${sectionId}/features`, {
            headers: {
              ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
            },
          });
          
          let maxPosition = -1;
          if (maxPositionResponse.ok) {
            const existingFeatures = await maxPositionResponse.json();
            if (existingFeatures && existingFeatures.length > 0) {
              maxPosition = Math.max(...existingFeatures.map((f: any) => f.section_feature?.position || 0));
            }
          }

          // Add feature to section
          const addToSectionResponse = await fetch(`/api/admin/sections/${sectionId}/features`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
            },
            body: JSON.stringify({
              feature_id: createdFeature.id,
              position: maxPosition + 1,
            }),
          });

          if (addToSectionResponse.ok) {
            toast.success("Feature created and added to section successfully");
          } else {
            toast.success("Feature created successfully");
          }
        } catch (error) {
          console.error("Error adding feature to section:", error);
          toast.success("Feature created successfully");
        }
      } else {
        toast.success(`Feature ${isEdit ? "updated" : "created"} successfully`);
      }

      const redirectUrl = returnTo || (isEdit && initialData ? `/admin/features/${initialData.id}/edit` : "/admin/features");
      router.push(redirectUrl);
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
        <div className="rounded-xl bg-card text-card-foreground shadow-lg p-6 md:p-8">
          {/* Admin Settings Section */}
          <div className="pb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-primary/10 border border-primary/20 w-9 h-9 flex items-center justify-center">
                  <FontAwesomeIcon icon={faGear} className="h-4 w-4 text-primary" />
                </div>
                <div className="font-medium text-lg">Admin Settings</div>
              </div>
              <div className="text-sm text-muted-foreground">Admin configuration</div>
            </div>

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

          {/* Website Content Section */}
          <div className="pt-8">
            <Separator className="mb-8" />
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-primary/10 border border-primary/20 w-9 h-9 flex items-center justify-center">
                  <FontAwesomeIcon icon={faHeading} className="h-4 w-4 text-primary" />
                </div>
                <div className="font-medium text-lg">Website Content</div>
              </div>
              <div className="text-sm text-muted-foreground">Public-facing content</div>
            </div>

            <div className="space-y-6">
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
                name="subtitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subtitle</FormLabel>
                    <FormControl>
                      <TextareaShadow 
                        placeholder="Enter feature subtitle (supports newlines and rich text: **bold**, *italic*, [[primary]], {{secondary}})" 
                        style={{ minHeight: isMobile ? '200px' : '150px' }}
                        className="whitespace-pre-wrap"
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
          <Button
            type="button"
            variant="outline"
            className="bg-card hover:bg-card/80 h-11 px-6 md:h-10 md:px-4"
            asChild
            disabled={isSubmitting}
          >
            <Link href={returnTo || "/admin/features"}>Cancel</Link>
          </Button>
          <Button type="submit" disabled={isSubmitting} className="h-11 px-6 md:h-10 md:px-4">
            {isSubmitting ? "Saving..." : isEdit ? "Update Feature" : "Create Feature"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

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
import { Switch } from "@/components/ui/switch";
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
import { faGear, faBook } from "@fortawesome/free-solid-svg-icons";
import type { AIKnowledge } from "../types";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  kb_type: z.string().optional(),
  visibility: z.enum(["public", "private"]),
  is_active: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

type AIKnowledgeFormProps = {
  initialData?: AIKnowledge | null;
  isEdit?: boolean;
  returnTo?: string;
};

export function AIKnowledgeForm({ initialData, isEdit = false, returnTo }: AIKnowledgeFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      kb_type: initialData?.kb_type || "",
      visibility: initialData?.visibility || "private",
      is_active: initialData?.is_active ?? true,
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      const url = isEdit && initialData
        ? `/api/admin/ai-knowledge/${initialData.id}`
        : "/api/admin/ai-knowledge";
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
        throw new Error(error.error || `Failed to ${isEdit ? "update" : "create"} AI Knowledge`);
      }

      const createdKnowledge = await response.json();
      toast.success(`AI Knowledge ${isEdit ? "updated" : "created"} successfully`);
      
      if (isEdit) {
        const redirectUrl = returnTo || "/admin/ai-knowledge";
        router.push(redirectUrl);
      } else {
        router.push(`/admin/ai-knowledge/${createdKnowledge.id}`);
      }
      router.refresh();
    } catch (error: any) {
      console.error("Error saving AI Knowledge:", error);
      toast.error(error.message || `Failed to ${isEdit ? "update" : "create"} AI Knowledge`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
        <div className="rounded-xl bg-card text-card-foreground shadow-lg p-6 md:p-8">
          <div className="pb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-primary/10 border border-primary/20 w-9 h-9 flex items-center justify-center">
                  <FontAwesomeIcon icon={faGear} className="h-4 w-4 text-primary" />
                </div>
                <div className="font-medium text-lg">Admin Settings</div>
              </div>
              <div className="text-sm text-muted-foreground">Configuration</div>
            </div>

            <div className="space-y-6">
              <FormField
                control={form.control}
                name="kb_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Knowledge Base Type</FormLabel>
                    <Select 
                      onValueChange={(val) => field.onChange(val === "__none__" ? "" : val)} 
                      value={field.value || "__none__"}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type (optional)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="__none__">None</SelectItem>
                        <SelectItem value="support">Support</SelectItem>
                        <SelectItem value="internal">Internal</SelectItem>
                        <SelectItem value="workflow">Workflow</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Categorize this knowledge base (e.g., support, internal, workflow)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="visibility"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Visibility <span className="text-destructive">*</span>
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select visibility" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="private">Private</SelectItem>
                        <SelectItem value="public">Public</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Control who can access this knowledge base
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Active Status</FormLabel>
                      <FormDescription>
                        Enable or disable this knowledge base
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="pt-8">
            <Separator className="mb-8" />
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-primary/10 border border-primary/20 w-9 h-9 flex items-center justify-center">
                  <FontAwesomeIcon icon={faBook} className="h-4 w-4 text-primary" />
                </div>
                <div className="font-medium text-lg">Knowledge Base Content</div>
              </div>
              <div className="text-sm text-muted-foreground">Basic information</div>
            </div>

            <div className="space-y-6">
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
                        placeholder="e.g., Product Documentation, Support Knowledge Base"
                        {...field}
                      />
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
                        placeholder="Describe what this knowledge base contains..."
                        rows={4}
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
            <Link href={returnTo || "/admin/ai-knowledge"}>Cancel</Link>
          </Button>
          <Button type="submit" disabled={isSubmitting} className="h-11 px-6 md:h-10 md:px-4">
            {isSubmitting ? "Saving..." : isEdit ? "Update AI Knowledge" : "Create AI Knowledge"}
          </Button>
        </div>
      </form>
    </Form>
  );
}


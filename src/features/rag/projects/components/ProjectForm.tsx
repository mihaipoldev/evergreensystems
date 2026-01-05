"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { faFolder } from "@fortawesome/free-solid-svg-icons";
import type { Project } from "../types";

const formSchema = z.object({
  client_name: z.string().min(1, "Client name is required"),
  status: z.enum(["active", "onboarding", "delivered", "archived"]),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ProjectFormProps = {
  initialData?: Project | null;
  isEdit?: boolean;
  returnTo?: string;
};

export function ProjectForm({ initialData, isEdit = false, returnTo }: ProjectFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      client_name: initialData?.client_name || "",
      status: initialData?.status || "active",
      description: initialData?.description || "",
    },
  });


  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      const url = isEdit && initialData
        ? `/api/intel/projects/${initialData.id}`
        : "/api/intel/projects";
      const method = isEdit ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({
          client_name: values.client_name,
          status: values.status,
          description: values.description || null,
          // Workspace KB is auto-created by the API
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Failed to ${isEdit ? "update" : "create"} project`);
      }

      const createdProject = await response.json();
      toast.success(`Project ${isEdit ? "updated" : "created"} successfully`);
      
      if (isEdit) {
        const redirectUrl = returnTo || `/intel/projects/${initialData?.id}` || "/intel/projects";
        router.push(redirectUrl);
      } else {
        router.push(`/intel/projects/${createdProject.id}`);
      }
      router.refresh();
    } catch (error: any) {
      console.error("Error saving project:", error);
      toast.error(error.message || `Failed to ${isEdit ? "update" : "create"} project`);
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
                  <FontAwesomeIcon icon={faFolder} className="h-4 w-4 text-primary" />
                </div>
                <div className="font-medium text-lg">Project Information</div>
              </div>
            </div>

            <div className="space-y-6">
              <FormField
                control={form.control}
                name="client_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Client Name <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <InputShadow
                        placeholder="e.g., Acme Corporation"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      The name of the client for this project
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Status <span className="text-destructive">*</span>
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="onboarding">Onboarding</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Current status of the project
                    </FormDescription>
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
                        placeholder="Describe this project..."
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Additional details about the project
                    </FormDescription>
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
            <Link href={returnTo || (isEdit && initialData ? `/intel/projects/${initialData.id}` : "/intel/projects")}>Cancel</Link>
          </Button>
          <Button type="submit" disabled={isSubmitting} className="h-11 px-6 md:h-10 md:px-4">
            {isSubmitting ? "Saving..." : isEdit ? "Update Project" : "Create Project"}
          </Button>
        </div>
      </form>
    </Form>
  );
}


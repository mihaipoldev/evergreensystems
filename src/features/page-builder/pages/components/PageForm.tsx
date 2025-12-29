"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useCreatePage, useUpdatePage } from "@/lib/react-query/hooks";
import { Button } from "@/components/ui/button";
import { InputShadow } from "@/components/admin/forms/InputShadow";
import { TextareaShadow } from "@/components/admin/forms/TextareaShadow";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFile } from "@fortawesome/free-solid-svg-icons";
import type { Page } from "../types";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  type: z.string().min(1, "Type is required"),
});

type FormValues = z.infer<typeof formSchema>;

type PageFormProps = {
  initialData?: Page | null;
  isEdit?: boolean;
};


export function PageForm({ initialData, isEdit = false }: PageFormProps) {
  const router = useRouter();
  const createPage = useCreatePage();
  const updatePage = useUpdatePage();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      type: initialData?.type || "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      // Use React Query mutation
      if (isEdit && initialData) {
        await updatePage.mutateAsync({
          id: initialData.id,
          data: values,
        });
      } else {
        await createPage.mutateAsync(values);
      }


      toast.success(`Page ${isEdit ? "updated" : "created"} successfully`);
      // Redirect to site structure after update, pages list after create
      router.push(isEdit ? "/admin/site-structure" : "/admin/pages");
      router.refresh();
    } catch (error: any) {
      console.error("Error saving page:", error);
      toast.error(error.message || `Failed to ${isEdit ? "update" : "create"} page`);
    }
  };

  const isSubmitting = createPage.isPending || updatePage.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
        <div className="rounded-xl bg-card text-card-foreground shadow-lg p-6 md:p-8">
          {/* Basic Information Section */}
          <div className="pb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-primary/10 border border-primary/20 w-9 h-9 flex items-center justify-center">
                  <FontAwesomeIcon icon={faFile} className="h-4 w-4 text-primary" />
                </div>
                <div className="font-medium text-lg">Basic Information</div>
              </div>
              <div className="text-sm text-muted-foreground">Page details</div>
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
                      <InputShadow placeholder="Enter page title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Type <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Select
                        value={field.value || ""}
                        onValueChange={field.onChange}
                        disabled={isEdit}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select page type">
                            {field.value || "Select page type"}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="home">Home</SelectItem>
                          <SelectItem value="contact">Contact</SelectItem>
                          <SelectItem value="about">About</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="mt-6">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <TextareaShadow
                        placeholder="Enter page description"
                        style={{ minHeight: '100px' }}
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
            <Link href="/admin/pages">Cancel</Link>
          </Button>
          <Button type="submit" disabled={isSubmitting} className="h-11 px-6 md:h-10 md:px-4">
            {isSubmitting ? "Saving..." : isEdit ? "Update Page" : "Create Page"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

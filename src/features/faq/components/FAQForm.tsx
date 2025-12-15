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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import type { FAQItem } from "../types";

const formSchema = z.object({
  question: z.string().min(1, "Question is required"),
  answer: z.string().min(1, "Answer is required"),
});

type FormValues = z.infer<typeof formSchema>;

type FAQFormProps = {
  initialData?: FAQItem | null;
  isEdit?: boolean;
  returnTo?: string;
};

export function FAQForm({ initialData, isEdit = false, returnTo }: FAQFormProps) {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      question: initialData?.question || "",
      answer: initialData?.answer || "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      const url = isEdit && initialData
        ? `/api/admin/faq-items/${initialData.id}`
        : "/api/admin/faq-items";
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
        throw new Error(error.error || `Failed to ${isEdit ? "update" : "create"} FAQ item`);
      }

      toast.success(`FAQ item ${isEdit ? "updated" : "created"} successfully`);
      const redirectUrl = returnTo || "/admin/faq";
      router.push(redirectUrl);
      router.refresh();
    } catch (error: any) {
      console.error("Error saving FAQ item:", error);
      toast.error(error.message || `Failed to ${isEdit ? "update" : "create"} FAQ item`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
        <div className="rounded-xl bg-card text-card-foreground shadow-lg p-6 md:p-8 space-y-6">
          <FormField
            control={form.control}
            name="question"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Question <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <TextareaShadow
                    placeholder="Enter the question"
                    style={{ minHeight: isMobile ? '200px' : '120px' }}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="answer"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Answer <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <TextareaShadow
                    placeholder="Enter the answer"
                    style={{ minHeight: isMobile ? '200px' : '120px' }}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />


        </div>
        <div className="flex items-center justify-end gap-4 mt-6">
          <Button
            type="button"
            variant="outline"
            className="bg-card hover:bg-card/80 h-11 px-6 md:h-10 md:px-4"
            asChild
            disabled={isSubmitting}
          >
            <Link href={returnTo || "/admin/faq"}>Cancel</Link>
          </Button>
          <Button type="submit" disabled={isSubmitting} className="h-11 px-6 md:h-10 md:px-4">
            {isSubmitting ? "Saving..." : isEdit ? "Update FAQ Item" : "Create FAQ Item"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

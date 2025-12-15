"use client";

import { useState } from "react";
import { PageSectionStatusSelector } from "@/components/admin/PageSectionStatusSelector";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

type SectionStatusHeaderProps = {
  pageId: string;
  pageSectionId: string;
  initialStatus: "published" | "draft" | "deactivated";
};

export function SectionStatusHeader({
  pageId,
  pageSectionId,
  initialStatus,
}: SectionStatusHeaderProps) {
  const [status, setStatus] = useState<"published" | "draft" | "deactivated">(initialStatus);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async (newStatus: "published" | "draft" | "deactivated") => {
    const oldStatus = status;
    
    // Optimistic update
    setStatus(newStatus);
    setIsUpdating(true);

    try {
      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      const response = await fetch(
        `/api/admin/pages/${pageId}/sections/${pageSectionId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      const statusLabels = {
        published: "published",
        draft: "set to draft",
        deactivated: "deactivated",
      };
      toast.success(`Section ${statusLabels[newStatus]}`);
    } catch (error: any) {
      console.error("Error updating status:", error);
      toast.error(error.message || "Failed to update status");
      // Revert optimistic update
      setStatus(oldStatus);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <PageSectionStatusSelector
      status={status}
      onStatusChange={handleStatusChange}
      disabled={isUpdating}
    />
  );
}

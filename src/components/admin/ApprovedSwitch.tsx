"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

type ApprovedSwitchProps = {
  testimonialId?: string;
  initialApproved: boolean;
  // Controlled mode props
  value?: boolean;
  onValueChange?: (checked: boolean) => void;
};

export function ApprovedSwitch({ 
  testimonialId, 
  initialApproved,
  value,
  onValueChange,
}: ApprovedSwitchProps) {
  // Use controlled mode if value and onValueChange are provided
  const isControlled = value !== undefined && onValueChange !== undefined;
  const [uncontrolledApproved, setUncontrolledApproved] = useState(initialApproved);
  const [isUpdating, setIsUpdating] = useState(false);

  const approved = isControlled ? value : uncontrolledApproved;

  const handleToggle = async (checked: boolean) => {
    // If controlled mode, just call the onChange handler
    if (isControlled && onValueChange) {
      onValueChange(checked);
      return;
    }

    // Otherwise, use the old behavior (direct save to database)
    if (!testimonialId) {
      console.error("testimonialId is required for uncontrolled mode");
      return;
    }

    setIsUpdating(true);
    try {
      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      const response = await fetch(`/api/admin/testimonials/${testimonialId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({ approved: checked }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update approved status");
      }

      setUncontrolledApproved(checked);
      toast.success(`Testimonial ${checked ? "approved" : "unapproved"}`);
    } catch (error: any) {
      console.error("Error updating approved status:", error);
      toast.error(error.message || "Failed to update approved status");
      // Revert the switch state on error
      setUncontrolledApproved(!checked);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Switch
      checked={approved}
      onCheckedChange={handleToggle}
      disabled={isUpdating}
      className="h-7 w-12 shadow-sm [&>span]:h-5 [&>span]:w-5 data-[state=checked]:[&>span]:translate-x-5"
    />
  );
}

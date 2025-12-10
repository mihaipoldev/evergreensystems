"use client";

import { useState } from "react";
import Link from "next/link";
import { CardList } from "@/components/admin/CardList";
import { ActionMenu } from "@/components/admin/ActionMenu";
import { AdminToolbar } from "@/components/admin/AdminToolbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faLink, faToggleOn, faToggleOff } from "@fortawesome/free-solid-svg-icons";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type { CTAButton } from "../types";

type CTAButtonsListProps = {
  initialCTAButtons: CTAButton[];
};

export function CTAButtonsList({ initialCTAButtons }: CTAButtonsListProps) {
  const [ctaButtons, setCTAButtons] = useState<CTAButton[]>(initialCTAButtons);
  const [searchQuery, setSearchQuery] = useState("");

  const handleDelete = async (id: string) => {
    try {
      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      const response = await fetch(`/api/admin/cta-buttons/${id}`, {
        method: "DELETE",
        headers: {
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete CTA button");
      }

      toast.success("CTA button deleted successfully");
      setCTAButtons(ctaButtons.filter((btn) => btn.id !== id));
    } catch (error: any) {
      console.error("Error deleting CTA button:", error);
      toast.error(error.message || "Failed to delete CTA button");
      throw error;
    }
  };

  const handleToggleStatus = async (button: CTAButton) => {
    try {
      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      const nextStatus = button.status === "active" ? "deactivated" : "active";

      const response = await fetch(`/api/admin/cta-buttons/${button.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update status");
      }

      const updatedCTA = await response.json();

      // Update state with the response data
      setCTAButtons((buttons) =>
        buttons.map((btn) =>
          btn.id === button.id ? { ...btn, ...updatedCTA } : btn
        )
      );
      toast.success(`CTA button ${nextStatus === "active" ? "activated" : "deactivated"}`);
    } catch (error: any) {
      console.error("Error toggling CTA status:", error);
      toast.error(error.message || "Failed to update status");
    }
  };

  const filteredCTAButtons = ctaButtons.filter((button) => {
    const query = searchQuery.toLowerCase();
    return (
      button.label.toLowerCase().includes(query) ||
      button.url.toLowerCase().includes(query) ||
      button.style?.toLowerCase().includes(query) ||
      button.icon?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="w-full">
      <div className="mb-6 md:mb-8 relative">
        <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-primary/20 via-primary/10 to-transparent rounded-full" />
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-3 mb-2">
            <h1 className="text-4xl font-bold text-foreground leading-none">CTA Buttons</h1>
            <span className="inline-flex items-center justify-center h-5 px-2.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 leading-none">
              ({filteredCTAButtons.length} {filteredCTAButtons.length === 1 ? "button" : "buttons"})
            </span>
          </div>
          <p className="text-base text-muted-foreground">
            Manage call-to-action buttons.
          </p>
        </div>
      </div>
      <div className="space-y-3 md:space-y-4">
        <AdminToolbar
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search CTA buttons..."
        >
          <Button
            asChild
            variant="ghost"
            className="rounded-full w-10 h-10 p-0 bg-transparent text-muted-foreground hover:text-primary hover:bg-transparent border-0 shadow-none transition-colors"
            title="New CTA Button"
          >
            <Link href="/admin/cta/new">
              <FontAwesomeIcon icon={faPlus} className="h-5 w-5" />
            </Link>
          </Button>
        </AdminToolbar>

        {filteredCTAButtons.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/60 bg-muted/30 p-8 text-center text-muted-foreground">
            {searchQuery
              ? "No CTA buttons found matching your search"
              : "No CTA buttons found"}
          </div>
        ) : (
          <div className="space-y-2">
            <CardList
              items={filteredCTAButtons}
              renderContent={(button) => (
                <div className="flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-3">
                    <Link
                      href={`/admin/cta/${button.id}/edit`}
                      className="text-base font-semibold text-foreground leading-snug hover:text-primary transition-colors cursor-pointer"
                    >
                      {button.label}
                    </Link>
                    <Badge
                      variant={button.status === "active" ? "default" : "outline"}
                      className="text-xs flex-shrink-0"
                    >
                      {button.status === "active" ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    {button.icon && (
                      <div className="h-8 w-8 rounded-full overflow-hidden flex items-center justify-center bg-muted flex-shrink-0">
                        <FontAwesomeIcon
                          icon={button.icon as any}
                          className="h-4 w-4 text-primary"
                        />
                      </div>
                    )}
                    <a
                      href={button.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5 truncate"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <FontAwesomeIcon icon={faLink} className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{button.url}</span>
                    </a>
                  </div>
                  {button.style && (
                    <div className="text-xs text-muted-foreground">
                      Style: {button.style}
                    </div>
                  )}
                </div>
              )}
              renderActions={(button) => (
                <ActionMenu
                  itemId={button.id}
                  editHref={`/admin/cta/${button.id}/edit`}
                  onDelete={handleDelete}
                  deleteLabel={`CTA button "${button.label}"`}
                  customActions={[
                    {
                      label: button.status === "active" ? "Deactivate" : "Activate",
                      icon: (
                        <FontAwesomeIcon
                          icon={button.status === "active" ? faToggleOff : faToggleOn}
                          className="h-4 w-4"
                        />
                      ),
                      onClick: () => handleToggleStatus(button),
                    },
                  ]}
                />
              )}
            />
          </div>
        )}
      </div>
    </div>
  );
}

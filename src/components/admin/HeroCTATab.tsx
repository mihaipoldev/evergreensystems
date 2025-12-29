"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { AdminToolbar } from "@/components/admin/AdminToolbar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faTrash,
  faMousePointer,
  faLink,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIconFromClass } from "@/components/admin/FontAwesomeIconFromClass";
import { ActionMenu } from "@/components/admin/ActionMenu";
import { CTAButtonSelector } from "@/components/admin/CTAButtonSelector";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { CTAButton, CTAButtonWithSection } from "@/features/page-builder/cta/types";

type HeroCTATabProps = {
  sectionId: string;
  initialCTAButtons: CTAButtonWithSection[];
};

export function HeroCTATab({ sectionId, initialCTAButtons }: HeroCTATabProps) {
  const [sectionCTAButtons, setSectionCTAButtons] = useState<CTAButtonWithSection[]>(initialCTAButtons);
  const [allCTAButtons, setAllCTAButtons] = useState<CTAButton[]>([]);
  const [isCTASelectorOpen, setIsCTASelectorOpen] = useState(false);

  useEffect(() => {
    loadSectionCTAs();
    loadAllCTAButtons();
  }, [sectionId]);

  const loadSectionCTAs = async () => {
    try {
      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      const response = await fetch(`/api/admin/sections/${sectionId}/cta-buttons`, {
        headers: {
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
      });

      if (response.ok) {
        const ctaButtons = await response.json();
        setSectionCTAButtons(ctaButtons);
      }
    } catch (error) {
      console.error("Error loading section CTA buttons:", error);
    }
  };

  const loadAllCTAButtons = async () => {
    try {
      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      const response = await fetch("/api/admin/cta-buttons", {
        headers: {
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
      });

      if (response.ok) {
        const ctaButtons = await response.json();
        // Filter to only show active CTAs
        setAllCTAButtons(ctaButtons || []);
      }
    } catch (error) {
      console.error("Error loading all CTA buttons:", error);
    }
  };

  const handleAddCTA = async (ctaButtonIds: string[]) => {
    if (ctaButtonIds.length === 0) return;

    // Hero sections can only have one CTA button, so take the first one
    const ctaButtonId = ctaButtonIds[0];

    // If there's already a CTA button, remove it first
    if (sectionCTAButtons.length > 0) {
      await handleRemoveCTA(sectionCTAButtons[0].id);
    }

    try {
      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      const response = await fetch(`/api/admin/sections/${sectionId}/cta-buttons`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({
          cta_button_id: ctaButtonId,
          position: 0,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to add CTA button");
      }

      const ctaButtonWithSection = await response.json();
      setSectionCTAButtons([ctaButtonWithSection]);
      setIsCTASelectorOpen(false);
      toast.success("CTA button added successfully");
      await loadSectionCTAs();
    } catch (error: any) {
      console.error("Error adding CTA button:", error);
      toast.error(error.message || "Failed to add CTA button");
    }
  };

  const handleRemoveCTA = async (ctaButtonId: string): Promise<void> => {
    try {
      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      const ctaButtonItem = sectionCTAButtons.find((c) => c.id === ctaButtonId);
      if (!ctaButtonItem) return;

      const response = await fetch(
        `/api/admin/sections/${sectionId}/cta-buttons?section_cta_button_id=${ctaButtonItem.section_cta_button.id}`,
        {
          method: "DELETE",
          headers: {
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to remove CTA button");
      }

      setSectionCTAButtons(sectionCTAButtons.filter((c) => c.id !== ctaButtonId));
      toast.success("CTA button removed successfully");
    } catch (error: any) {
      console.error("Error removing CTA button:", error);
      toast.error(error.message || "Failed to remove CTA button");
      throw error; // Re-throw so ActionMenu can handle it
    }
  };

  const selectedCTAIds = sectionCTAButtons.map((c) => c.id);
  const unselectedCTAs = allCTAButtons.filter((c) => !selectedCTAIds.includes(c.id));

  return (
    <div className="w-full space-y-4">
      <AdminToolbar>
        <Button
          onClick={() => setIsCTASelectorOpen(true)}
          variant="ghost"
          className="rounded-full w-10 h-10 p-0 bg-transparent text-muted-foreground hover:text-primary hover:bg-transparent border-0 shadow-none transition-colors"
          title="Add CTA"
        >
          <FontAwesomeIcon icon={faPlus} className="h-5 w-5" />
        </Button>
      </AdminToolbar>

      {/* Selected CTA Buttons Section */}
      {sectionCTAButtons.length > 0 && (
        <div className="space-y-4 mb-6">
            {sectionCTAButtons.map((item) => (
              <div
                key={item.id}
                className={cn(
                  "group relative bg-card border-2 border-primary rounded-lg p-4 py-2"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 bg-primary/10">
                    <FontAwesomeIconFromClass
                      iconClass={item.icon}
                      fallbackIcon={faMousePointer}
                      className="h-5 w-5 text-primary"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-semibold text-sm line-clamp-1">
                        {item.label}
                      </h3>
                      <ActionMenu
                        itemId={item.id}
                        editHref={`/admin/cta/${item.id}/edit`}
                        onDelete={async () => {
                          await handleRemoveCTA(item.id);
                        }}
                        deleteLabel="this CTA button from the hero section"
                      />
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                      <FontAwesomeIcon icon={faLink} className="h-3 w-3" />
                      <span className="truncate">{item.url}</span>
                    </div>
                    {item.style && (
                      <div className="text-xs text-muted-foreground">
                        Style: {item.style}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
      )}

      {/* Unselected CTA Buttons Section */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">
            {sectionCTAButtons.length > 0 ? "Other CTA Buttons" : "Available CTA Buttons"}
          </h3>
          <p className="text-sm text-muted-foreground">
            {sectionCTAButtons.length > 0
              ? "Click on a CTA button to replace the selected one"
              : "Click on a CTA button to select it"}
          </p>
        </div>
        {unselectedCTAs.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground border rounded-lg">
            {sectionCTAButtons.length > 0
              ? "No other CTA buttons available"
              : "No CTA buttons available. Create one to get started."}
          </div>
        ) : (
          <div className="space-y-4">
            {unselectedCTAs.map((item) => (
              <div
                key={item.id}
                className={cn(
                  "group relative bg-card border rounded-lg p-4 py-2 cursor-pointer transition-all hover:border-primary/50 hover:shadow-md"
                )}
                onClick={() => handleAddCTA([item.id])}
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 bg-muted">
                    <FontAwesomeIconFromClass
                      iconClass={item.icon}
                      fallbackIcon={faMousePointer}
                      className="h-5 w-5 text-muted-foreground"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-semibold text-sm line-clamp-1">
                        {item.label}
                      </h3>
                      <div onClick={(e) => e.stopPropagation()}>
                        <ActionMenu
                          itemId={item.id}
                          editHref={`/admin/cta/${item.id}/edit`}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                      <FontAwesomeIcon icon={faLink} className="h-3 w-3" />
                      <span className="truncate">{item.url}</span>
                    </div>
                    {item.style && (
                      <div className="text-xs text-muted-foreground">
                        Style: {item.style}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CTA Button Selector Dialog */}
      <CTAButtonSelector
        open={isCTASelectorOpen}
        onOpenChange={setIsCTASelectorOpen}
        onSelect={handleAddCTA}
        selectedCTAButtonIds={selectedCTAIds}
        multiple={false}
      />
    </div>
  );
}

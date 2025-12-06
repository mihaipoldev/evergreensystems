"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { InputShadow } from "@/components/admin/forms/InputShadow";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faSearch,
  faMousePointer,
  faLink,
} from "@fortawesome/free-solid-svg-icons";
import { cn } from "@/lib/utils";
import type { CTAButton } from "@/features/cta/types";

type CTAButtonSelectorProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (ctaButtonIds: string[]) => void;
  selectedCTAButtonIds?: string[];
  multiple?: boolean;
};

export function CTAButtonSelector({
  open,
  onOpenChange,
  onSelect,
  selectedCTAButtonIds = [],
  multiple = true,
}: CTAButtonSelectorProps) {
  const [ctaButtons, setCTAButtons] = useState<CTAButton[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>(selectedCTAButtonIds);

  useEffect(() => {
    if (open) {
      setSelectedIds(selectedCTAButtonIds);
      fetchCTAButtons();
    }
  }, [open, selectedCTAButtonIds]);

  const fetchCTAButtons = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      const response = await fetch("/api/admin/cta-buttons", {
        headers: {
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch CTA buttons");
      }

      const data = await response.json();
      // Filter to only show active CTAs
      setCTAButtons((data || []).filter((btn: CTAButton) => btn.status === "active"));
    } catch (error) {
      console.error("Error fetching CTA buttons:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCTAButtons = ctaButtons.filter((item) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      item.label.toLowerCase().includes(query) ||
      item.url.toLowerCase().includes(query) ||
      (item.style || "").toLowerCase().includes(query) ||
      (item.icon || "").toLowerCase().includes(query)
    );
  });

  const handleToggleSelect = (ctaButtonId: string) => {
    if (multiple) {
      setSelectedIds((prev) =>
        prev.includes(ctaButtonId)
          ? prev.filter((id) => id !== ctaButtonId)
          : [...prev, ctaButtonId]
      );
    } else {
      setSelectedIds([ctaButtonId]);
    }
  };

  const handleConfirm = () => {
    onSelect(selectedIds);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {multiple ? "Select CTA Buttons" : "Select a CTA Button"}
          </DialogTitle>
          <DialogDescription>
            {multiple
              ? "Choose one or more CTA buttons to add to this section."
              : "Choose a CTA button to add to this section."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 space-y-4 overflow-hidden flex flex-col">
          {/* Search */}
          <div className="relative">
            <FontAwesomeIcon
              icon={faSearch}
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            />
            <InputShadow
              placeholder="Search CTA buttons..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* CTA Buttons List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">Loading...</div>
            ) : filteredCTAButtons.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                {searchQuery
                  ? "No CTA buttons found matching your search"
                  : "No active CTA buttons available"}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredCTAButtons.map((item) => {
                  const isSelected = selectedIds.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleToggleSelect(item.id)}
                      className={cn(
                        "group relative bg-card border rounded-lg p-4 cursor-pointer transition-all",
                        isSelected
                          ? "ring-2 ring-primary border-primary bg-primary/5"
                          : "hover:border-primary/50 hover:shadow-md"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors",
                          isSelected ? "bg-primary/10" : "bg-muted"
                        )}>
                          <FontAwesomeIcon
                            icon={item.icon ? (item.icon as any) : faMousePointer}
                            className={cn(
                              "h-5 w-5",
                              isSelected ? "text-primary" : "text-muted-foreground"
                            )}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h3 className="font-semibold text-sm line-clamp-1">
                              {item.label}
                            </h3>
                            {isSelected && (
                              <div className="bg-primary text-primary-foreground rounded-full p-1 flex-shrink-0">
                                <FontAwesomeIcon icon={faCheck} className="h-3 w-3" />
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                            <FontAwesomeIcon icon={faLink} className="h-3 w-3" />
                            <span className="truncate">{item.url}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={item.status === "active" ? "default" : "outline"}
                              className="text-xs"
                            >
                              {item.status === "active" ? "Active" : "Deactivated"}
                            </Badge>
                            {item.style && (
                              <span className="text-xs text-muted-foreground">
                                Style: {item.style}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={selectedIds.length === 0}>
            Select {selectedIds.length > 0 && `(${selectedIds.length})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

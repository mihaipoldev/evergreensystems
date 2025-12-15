"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { AdminToolbar } from "@/components/admin/AdminToolbar";
import { SortableCardList } from "@/components/admin/SortableCardList";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faCheck, faX, faBullseye } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIconFromClass } from "@/components/admin/FontAwesomeIconFromClass";
import { ActionMenu } from "@/components/admin/ActionMenu";
import { PageSectionStatusSelector } from "@/components/admin/PageSectionStatusSelector";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { OfferFeature, OfferFeatureWithSection } from "@/features/features/types";

type SectionFeaturesTabProps = {
  sectionId: string;
  pageId: string;
  initialFeatures: OfferFeatureWithSection[];
};

export function SectionFeaturesTab({ sectionId, pageId, initialFeatures }: SectionFeaturesTabProps) {
  const [sectionFeatures, setSectionFeatures] = useState<OfferFeatureWithSection[]>(initialFeatures);
  const [allFeatures, setAllFeatures] = useState<OfferFeature[]>([]);

  useEffect(() => {
    loadSectionFeatures();
    loadAllFeatures();
  }, [sectionId]);

  const loadSectionFeatures = async () => {
    try {
      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      const response = await fetch(`/api/admin/sections/${sectionId}/features`, {
        headers: {
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
      });

      if (response.ok) {
        const features = await response.json();
        setSectionFeatures(features);
      }
    } catch (error) {
      console.error("Error loading section features:", error);
    }
  };

  const loadAllFeatures = async () => {
    try {
      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      const response = await fetch("/api/admin/offer-features", {
        headers: {
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
      });

      if (response.ok) {
        const features = await response.json();
        setAllFeatures(features || []);
      }
    } catch (error) {
      console.error("Error loading all features:", error);
    }
  };

  const handleAddFeature = async (featureId: string) => {
    try {
      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      const maxPosition = sectionFeatures.length > 0 
        ? Math.max(...sectionFeatures.map((f) => f.section_feature.position))
        : -1;

      const response = await fetch(`/api/admin/sections/${sectionId}/features`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({
          feature_id: featureId,
          position: maxPosition + 1,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to add feature");
      }

      toast.success("Feature added successfully");
      await loadSectionFeatures();
    } catch (error: any) {
      console.error("Error adding feature:", error);
      toast.error(error.message || "Failed to add feature");
    }
  };

  const handleRemoveFeature = async (featureId: string): Promise<void> => {
    try {
      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      const feature = sectionFeatures.find((f) => f.id === featureId);
      if (!feature) return;

      const response = await fetch(
        `/api/admin/sections/${sectionId}/features?section_feature_id=${feature.section_feature.id}`,
        {
          method: "DELETE",
          headers: {
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to remove feature");
      }

      setSectionFeatures(sectionFeatures.filter((f) => f.id !== featureId));
      toast.success("Feature removed successfully");
    } catch (error: any) {
      console.error("Error removing feature:", error);
      toast.error(error.message || "Failed to remove feature");
      throw error;
    }
  };

  const handleReorder = useCallback(async (orderedItems: OfferFeatureWithSection[]) => {
    const newOrder = orderedItems.map((item, index) => ({ ...item, section_feature: { ...item.section_feature, position: index } }));

    let previousItems: OfferFeatureWithSection[] = [];
    setSectionFeatures((prev) => {
      previousItems = prev;
      return newOrder;
    });

    const toastId = toast.loading("Saving order...");

    try {
      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      const response = await fetch(`/api/admin/sections/${sectionId}/features/reorder`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({
          items: newOrder.map((item, index) => ({
            section_feature_id: item.section_feature.id,
            position: index,
          })),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to reorder features");
      }

      toast.success("Features reordered successfully", { id: toastId });
    } catch (error: any) {
      console.error("Error reordering features:", error);
      toast.error(error.message || "Failed to reorder features", { id: toastId });
      setSectionFeatures(previousItems);
    }
  }, [sectionId]);

  const renderContent = useCallback((feature: OfferFeatureWithSection) => (
    <div className="flex items-center gap-3">
      <div className="h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 bg-primary/10">
        <FontAwesomeIconFromClass
          iconClass={feature.icon}
          fallbackIcon={faBullseye}
          className="h-5 w-5 text-primary"
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-2">
          <h3 className="font-semibold text-sm line-clamp-1">
            {feature.title}
          </h3>
          <PageSectionStatusSelector
            status={feature.section_feature.status}
            onStatusChange={async (newStatus) => {
              const supabase = createClient();
              const { data: sessionData } = await supabase.auth.getSession();
              const accessToken = sessionData?.session?.access_token;
              
              const response = await fetch(`/api/admin/sections/${sectionId}/features/${feature.section_feature.id}`, {
                method: "PATCH",
                headers: {
                  "Content-Type": "application/json",
                  ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
                },
                body: JSON.stringify({ status: newStatus }),
              });
              
              if (response.ok) {
                await loadSectionFeatures();
              }
            }}
          />
        </div>
        {feature.subtitle && (
          <p className="text-xs text-muted-foreground mb-1">
            {feature.subtitle}
          </p>
        )}
        {feature.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {feature.description}
          </p>
        )}
      </div>
    </div>
  ), []);

  const renderActions = useCallback((feature: OfferFeatureWithSection) => (
    <ActionMenu
      itemId={feature.id}
      editHref={`/admin/features/${feature.id}/edit`}
      onDelete={async () => {
        await handleRemoveFeature(feature.id);
      }}
      deleteLabel="this feature from the section"
      customActions={[
        {
          label: "Deselect",
          icon: <FontAwesomeIcon icon={faX} className="h-4 w-4" />,
          onClick: async () => {
            await handleRemoveFeature(feature.id);
          },
        },
      ]}
    />
  ), []);

  const selectedFeatureIds = sectionFeatures.map((f) => f.id);
  const unselectedFeatures = allFeatures.filter((f) => !selectedFeatureIds.includes(f.id));

  return (
    <div className="w-full space-y-4">
      <AdminToolbar>
        <Button
          asChild
          variant="ghost"
          className="rounded-full w-10 h-10 p-0 bg-transparent text-muted-foreground hover:text-primary hover:bg-transparent border-0 shadow-none transition-colors"
          title="Add Feature"
        >
          <Link href={`/admin/features/new?returnTo=/admin/pages/${pageId}/sections/${sectionId}?tab=features`}>
            <FontAwesomeIcon icon={faPlus} className="h-5 w-5" />
          </Link>
        </Button>
      </AdminToolbar>

      {/* Selected Features */}
      {sectionFeatures.length > 0 && (
        <div className="space-y-4 mb-6">
          <h3 className="text-lg font-semibold">Connected Features</h3>
          <SortableCardList
            items={sectionFeatures}
            onReorder={handleReorder}
            renderContent={renderContent}
            renderActions={renderActions}
          />
        </div>
      )}

      {/* Unselected Features */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">
            {sectionFeatures.length > 0 ? "Other Features" : "Available Features"}
          </h3>
          <p className="text-sm text-muted-foreground">
            Click the action menu to add features to this section
          </p>
        </div>
        {unselectedFeatures.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground border rounded-lg">
            {sectionFeatures.length > 0
              ? "No other features available"
              : "No features available. Create one to get started."}
          </div>
        ) : (
          <div className="space-y-4">
            {unselectedFeatures.map((feature) => (
              <div
                key={feature.id}
                className="group relative bg-card border rounded-lg p-4 transition-all hover:border-primary/50 hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 bg-muted">
                    <FontAwesomeIconFromClass
                      iconClass={feature.icon}
                      fallbackIcon={faBullseye}
                      className="h-5 w-5 text-muted-foreground"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-sm line-clamp-1">
                        {feature.title}
                      </h3>
                      <ActionMenu
                        itemId={feature.id}
                        editHref={`/admin/features/${feature.id}/edit?returnTo=/admin/pages/${pageId}/sections/${sectionId}?tab=features`}
                        customActions={[
                          {
                            label: "Select",
                            icon: <FontAwesomeIcon icon={faCheck} className="h-4 w-4" />,
                            onClick: async () => {
                              await handleAddFeature(feature.id);
                            },
                          },
                        ]}
                      />
                    </div>
                    {feature.subtitle && (
                      <p className="text-xs text-muted-foreground mb-1">
                        {feature.subtitle}
                      </p>
                    )}
                    {feature.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {feature.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

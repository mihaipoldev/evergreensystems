"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { AdminToolbar } from "@/components/admin/ui/AdminToolbar";
import { SortableCardList } from "@/components/admin/ui/SortableCardList";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faCheck, faX, faCode } from "@fortawesome/free-solid-svg-icons";
import { ActionMenu } from "@/components/admin/ui/ActionMenu";
import { PageSectionStatusSelector } from "@/features/page-builder/pages/components/PageSectionStatusSelector";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useDuplicateSoftware, useDeleteSoftware } from "@/features/page-builder/softwares/hooks";
import type { Software, SoftwareWithSection } from "@/features/page-builder/softwares/types";

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.toLocaleDateString('en-US', { month: 'long' });
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
};

type SectionSoftwaresTabProps = {
  sectionId: string;
  pageId?: string;
  initialSoftwares: SoftwareWithSection[];
};

export function SectionSoftwaresTab({ sectionId, pageId, initialSoftwares }: SectionSoftwaresTabProps) {
  const [sectionSoftwares, setSectionSoftwares] = useState<SoftwareWithSection[]>(initialSoftwares);
  const [allSoftwares, setAllSoftwares] = useState<Software[]>([]);
  const duplicateSoftware = useDuplicateSoftware();
  const deleteSoftware = useDeleteSoftware();

  const loadSectionSoftwares = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      const response = await fetch(`/api/admin/sections/${sectionId}/softwares`, {
        headers: {
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
      });

      if (response.ok) {
        const softwares = await response.json();
        setSectionSoftwares(softwares);
      }
    } catch (error) {
      console.error("Error loading section softwares:", error);
    }
  }, [sectionId]);

  const loadAllSoftwares = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      const response = await fetch("/api/admin/softwares", {
        headers: {
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
      });

      if (response.ok) {
        const softwares = await response.json();
        setAllSoftwares(softwares || []);
      }
    } catch (error) {
      console.error("Error loading all softwares:", error);
    }
  }, []);

  useEffect(() => {
    loadSectionSoftwares();
    loadAllSoftwares();
  }, [loadSectionSoftwares, loadAllSoftwares]);


  const handleAddSoftware = async (softwareId: string) => {
    try {
      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      const maxOrder = sectionSoftwares.length > 0 
        ? Math.max(...sectionSoftwares.map((s) => s.section_software.order))
        : -1;

      const response = await fetch(`/api/admin/sections/${sectionId}/softwares`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({
          software_id: softwareId,
          order: maxOrder + 1,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to add software");
      }

      toast.success("Software added successfully");
      await loadSectionSoftwares();
    } catch (error: any) {
      console.error("Error adding software:", error);
      toast.error(error.message || "Failed to add software");
    }
  };

  const handleRemoveSoftware = async (softwareId: string): Promise<void> => {
    try {
      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      const software = sectionSoftwares.find((s) => s.id === softwareId);
      if (!software) return;

      const response = await fetch(
        `/api/admin/sections/${sectionId}/softwares?section_software_id=${software.section_software.id}`,
        {
          method: "DELETE",
          headers: {
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to remove software");
      }

      setSectionSoftwares(sectionSoftwares.filter((s) => s.id !== softwareId));
      toast.success("Software removed successfully");
    } catch (error: any) {
      console.error("Error removing software:", error);
      toast.error(error.message || "Failed to remove software");
      throw error;
    }
  };

  const handleDuplicate = useCallback(async (softwareId: string, isConnected: boolean = false) => {
    try {
      // Only pass sectionId if duplicating from connected section
      await duplicateSoftware.mutateAsync({ 
        id: softwareId, 
        sectionId: isConnected ? sectionId : undefined 
      });
      toast.success("Software duplicated successfully");
      await loadSectionSoftwares();
      await loadAllSoftwares();
    } catch (error: any) {
      console.error("Error duplicating software:", error);
      toast.error(error.message || "Failed to duplicate software");
      throw error;
    }
  }, [sectionId, duplicateSoftware, loadSectionSoftwares, loadAllSoftwares]);

  const handleDeleteSoftware = useCallback(async (softwareId: string) => {
    try {
      await deleteSoftware.mutateAsync(softwareId);
      toast.success("Software deleted successfully");
      await loadSectionSoftwares();
      await loadAllSoftwares();
    } catch (error: any) {
      console.error("Error deleting software:", error);
      toast.error(error.message || "Failed to delete software");
      throw error;
    }
  }, [deleteSoftware, loadSectionSoftwares, loadAllSoftwares]);

  const handleUpdateStatus = useCallback(async (software: SoftwareWithSection, newStatus: "published" | "draft" | "deactivated") => {
    try {
      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      const response = await fetch(`/api/admin/sections/${sectionId}/softwares`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({
          section_software_id: software.section_software.id,
          status: newStatus,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update status");
      }

      await loadSectionSoftwares();
    } catch (error: any) {
      console.error("Error updating status:", error);
      toast.error(error.message || "Failed to update status");
    }
  }, [sectionId]);

  const handleReorder = useCallback(async (orderedItems: SoftwareWithSection[]) => {
    const newOrder = orderedItems.map((item, index) => ({ ...item, section_software: { ...item.section_software, order: index } }));

    let previousItems: SoftwareWithSection[] = [];
    setSectionSoftwares((prev) => {
      previousItems = prev;
      return newOrder;
    });

    const toastId = toast.loading("Saving order...");

    try {
      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      const response = await fetch(`/api/admin/sections/${sectionId}/softwares/reorder`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({
          items: newOrder.map((item, index) => ({
            section_software_id: item.section_software.id,
            order: index,
          })),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to reorder softwares");
      }

      toast.success("Softwares reordered successfully", { id: toastId });
    } catch (error: any) {
      console.error("Error reordering softwares:", error);
      toast.error(error.message || "Failed to reorder softwares", { id: toastId });
      setSectionSoftwares(previousItems);
    }
  }, [sectionId]);

  const renderContent = useCallback((software: SoftwareWithSection) => {
    const displayIcon = software.section_software.icon_override || software.icon;
    return (
      <div className="flex items-center gap-3">
        {displayIcon ? (
          <div className="h-10 w-10 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 bg-primary/10">
            <img
              src={displayIcon}
              alt={software.name}
              className="h-8 w-8 object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
                const fallback = document.createElement("div");
                fallback.className = "h-5 w-5 text-primary";
                fallback.innerHTML = `<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2L3 7v11h4v-6h6v6h4V7l-7-5z"/></svg>`;
                target.parentElement?.appendChild(fallback);
              }}
            />
          </div>
        ) : (
          <div className="h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 bg-primary/10">
            <FontAwesomeIcon
              icon={faCode}
              className="h-5 w-5 text-primary"
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-2">
            <h3 className="font-semibold text-sm line-clamp-1">
              {software.name}
            </h3>
            <PageSectionStatusSelector
              status={software.section_software.status}
              onStatusChange={(newStatus) => handleUpdateStatus(software, newStatus)}
            />
          </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                      <span className="font-medium">Slug:</span>
                      <span>{software.slug}</span>
                      <span>•</span>
                      <span className="truncate">{software.website_url}</span>
                    </div>
                    {software.created_at && (
                      <div className="text-xs text-muted-foreground">
                        {formatDate(software.created_at)}
                      </div>
                    )}
        </div>
      </div>
    );
  }, [handleUpdateStatus]);

  const renderActions = useCallback((software: SoftwareWithSection) => (
    <ActionMenu
      itemId={software.id}
      editHref={`/admin/softwares/${software.id}/edit?returnTo=/admin/sections/${sectionId}?pageId=${pageId}&tab=softwares`}
      onDelete={async () => {
        await handleDeleteSoftware(software.id);
      }}
      onDuplicate={async () => {
        await handleDuplicate(software.id, true); // true = is connected
      }}
      deleteLabel="this software"
      customActions={[
        {
          label: "Deselect",
          icon: <FontAwesomeIcon icon={faX} className="h-4 w-4" />,
          onClick: async () => {
            await handleRemoveSoftware(software.id);
          },
        },
      ]}
    />
  ), [pageId, sectionId, handleRemoveSoftware, handleDuplicate, handleDeleteSoftware]);

  const selectedSoftwareIds = sectionSoftwares.map((s) => s.id);
  const unselectedSoftwares = allSoftwares
    .filter((s) => !selectedSoftwareIds.includes(s.id))
    .sort((a, b) => (a.name || "").localeCompare(b.name || ""));

  return (
    <div className="w-full space-y-4">
      <AdminToolbar>
        <Button
          asChild
          variant="ghost"
          className="rounded-full w-10 h-10 p-0 bg-transparent text-muted-foreground hover:text-primary hover:bg-transparent border-0 shadow-none transition-colors"
          title="Add Software"
        >
          <Link href={`/admin/softwares/new?returnTo=/admin/sections/${sectionId}?pageId=${pageId}&tab=softwares`}>
            <FontAwesomeIcon icon={faPlus} className="h-5 w-5" />
          </Link>
        </Button>
      </AdminToolbar>

      {/* Selected Softwares */}
      {sectionSoftwares.length > 0 && (
        <div className="space-y-4 mb-6">
          <h3 className="text-lg font-semibold">Connected Softwares</h3>
          <SortableCardList
            items={sectionSoftwares}
            onReorder={handleReorder}
            renderContent={renderContent}
            renderActions={renderActions}
          />
        </div>
      )}

      {/* Unselected Softwares */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">
            {sectionSoftwares.length > 0 ? "Other Softwares" : "Available Softwares"}
          </h3>
          <p className="text-sm text-muted-foreground">
            Click the action menu to add softwares to this section
          </p>
        </div>
        {unselectedSoftwares.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground border rounded-lg">
            {sectionSoftwares.length > 0
              ? "No other softwares available"
              : "No softwares available. Create one to get started."}
          </div>
        ) : (
          <div className="space-y-4">
            {unselectedSoftwares.map((software) => (
              <div
                key={software.id}
                className="group relative bg-card border rounded-lg p-4 transition-all hover:border-primary/50 hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  {software.icon ? (
                    <div className="h-10 w-10 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 bg-muted">
                      <img
                        src={software.icon}
                        alt={software.name}
                        className="h-8 w-8 object-contain"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = "none";
                          const fallback = document.createElement("div");
                          fallback.className = "h-5 w-5 text-muted-foreground";
                          fallback.innerHTML = `<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2L3 7v11h4v-6h6v6h4V7l-7-5z"/></svg>`;
                          target.parentElement?.appendChild(fallback);
                        }}
                      />
                    </div>
                  ) : (
                    <div className="h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 bg-muted">
                      <FontAwesomeIcon
                        icon={faCode}
                        className="h-5 w-5 text-muted-foreground"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-sm line-clamp-1">
                        {software.name}
                      </h3>
                      <ActionMenu
                        itemId={software.id}
                        editHref={`/admin/softwares/${software.id}/edit?returnTo=/admin/sections/${sectionId}?pageId=${pageId}&tab=softwares`}
                        onDelete={async () => {
                          await handleDeleteSoftware(software.id);
                        }}
                        onDuplicate={async () => {
                          await handleDuplicate(software.id, false); // false = not connected
                        }}
                        deleteLabel="this software"
                        customActions={[
                          {
                            label: "Select",
                            icon: <FontAwesomeIcon icon={faCheck} className="h-4 w-4" />,
                            onClick: async () => {
                              await handleAddSoftware(software.id);
                            },
                          },
                        ]}
                      />
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                      <span className="font-medium">Slug:</span>
                      <span>{software.slug}</span>
                      <span>•</span>
                      <span className="truncate">{software.website_url}</span>
                    </div>
                    {software.created_at && (
                      <div className="text-xs text-muted-foreground">
                        {formatDate(software.created_at)}
                      </div>
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

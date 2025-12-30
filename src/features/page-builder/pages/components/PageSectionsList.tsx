"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import Link from "next/link";
import { SortableCardList } from "@/components/admin/ui/SortableCardList";
import { ActionMenu } from "@/components/admin/ui/ActionMenu";
import { AdminToolbar } from "@/components/admin/ui/AdminToolbar";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faCheck, faX, faLayerGroup } from "@fortawesome/free-solid-svg-icons";
import { IconFromClass } from "@/components/admin/modals/IconFromClass";
import { PageSectionStatusSelector } from "./PageSectionStatusSelector";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/use-debounce";
import { useSections, useDuplicateSection, useDeleteSection } from "@/features/page-builder/sections/hooks";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import type { Section } from "@/features/page-builder/sections/types";

type PageSection = Section & {
  page_section_id: string;
  position: number;
  status: "published" | "draft" | "deactivated";
};

type PageSectionsListProps = {
  pageId: string;
  pageTitle: string;
  initialSections: PageSection[];
  hideHeader?: boolean;
};

export function PageSectionsList({ pageId, pageTitle, initialSections, hideHeader = false }: PageSectionsListProps) {
  const [pageSections, setPageSections] = useState<PageSection[]>(initialSections);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);
  const duplicateSection = useDuplicateSection();
  const deleteSection = useDeleteSection();

  // Create stable filters object to avoid query key changes
  const sectionsFilters = useMemo(
    () => (debouncedSearch ? { search: debouncedSearch } : {}),
    [debouncedSearch]
  );

  // Fetch all sections for the available sections list
  const { data: sectionsData = [], isLoading: isLoadingSections, error: sectionsError } = useSections(
    sectionsFilters,
    { 
      enabled: true,
      refetchOnMount: true,
      staleTime: 0, // Always consider data stale to ensure fresh fetch
    }
  );

  // Use sectionsData directly instead of storing in state to avoid infinite loops
  const allSections = sectionsData;

  // Debug logging
  useEffect(() => {
    console.log("🔍 [PageSectionsList] Debug Info:", {
      pageId,
      filters: sectionsFilters,
      isLoadingSections,
      sectionsError: sectionsError?.message,
      sectionsDataLength: sectionsData.length,
      sectionsData: sectionsData,
      pageSectionsLength: pageSections.length,
      pageSections: pageSections,
    });
  }, [pageId, sectionsFilters, isLoadingSections, sectionsError, sectionsData, pageSections]);

  const loadPageSections = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      const response = await fetch(`/api/admin/pages/${pageId}/sections`, {
        headers: {
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
      });

      if (response.ok) {
        const sections = await response.json();
        const pageSectionsData: PageSection[] = sections.map((section: any) => ({
          ...section,
          page_section_id: section.page_section_id || "",
          position: section.position ?? 0,
          status: section.status || "draft",
        }));
        setPageSections(pageSectionsData);
      }
    } catch (error) {
      console.error("Error loading page sections:", error);
    }
  }, [pageId]);

  const handleAddSection = async (sectionId: string) => {
    try {
      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      // Get the max position
      const maxPosition = pageSections.length > 0 
        ? Math.max(...pageSections.map((s) => s.position)) 
        : -1;

      const response = await fetch(`/api/admin/pages/${pageId}/sections/connect`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({
          section_id: sectionId,
          position: maxPosition + 1,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to add section");
      }

      const newPageSection = await response.json();
      const section = allSections.find((s) => s.id === sectionId);
      
      if (section) {
        setPageSections((prev) => [
          ...prev,
          {
            ...section,
            page_section_id: newPageSection.id,
            position: newPageSection.position,
            status: newPageSection.status || "draft",
          },
        ]);
      }

      toast.success("Section added successfully");
    } catch (error: any) {
      console.error("Error adding section:", error);
      toast.error(error.message || "Failed to add section");
    }
  };

  const handleRemoveSection = async (sectionId: string): Promise<void> => {
    try {
      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      const section = pageSections.find((s) => s.id === sectionId);
      if (!section?.page_section_id) return;

      const response = await fetch(
        `/api/admin/pages/${pageId}/sections/${section.page_section_id}`,
        {
          method: "DELETE",
          headers: {
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to remove section");
      }

      setPageSections((prev) => prev.filter((s) => s.id !== sectionId));
      toast.success("Section removed successfully");
    } catch (error: any) {
      console.error("Error removing section:", error);
      toast.error(error.message || "Failed to remove section");
      throw error;
    }
  };

  const handleDuplicate = useCallback(async (sectionId: string) => {
    try {
      // Check if this section is connected to the page
      const isConnected = pageSections.some((s) => s.id === sectionId);
      
      // Duplicate the section
      const duplicated = await duplicateSection.mutateAsync(sectionId);
      
      // If the original section was connected, also add the duplicate to the page
      if (isConnected) {
        const supabase = createClient();
        const { data: sessionData } = await supabase.auth.getSession();
        const accessToken = sessionData?.session?.access_token;

        // Get the max position
        const maxPosition = pageSections.length > 0 
          ? Math.max(...pageSections.map((s) => s.position)) 
          : -1;

        const response = await fetch(`/api/admin/pages/${pageId}/sections/connect`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          },
          body: JSON.stringify({
            section_id: duplicated.id,
            position: maxPosition + 1,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to add duplicated section to page");
        }

        const newPageSection = await response.json();
        const duplicatedSectionData = {
          ...duplicated,
          page_section_id: newPageSection.id,
          position: newPageSection.position,
          status: newPageSection.status || "draft",
        };
        
        // Add to local state
        setPageSections((prev) => [...prev, duplicatedSectionData]);
      }
      
      toast.success("Section duplicated successfully");
      // Reload page sections to ensure consistency
      await loadPageSections();
      // The useSections hook will automatically refetch due to query invalidation
    } catch (error: any) {
      console.error("Error duplicating section:", error);
      toast.error(error.message || "Failed to duplicate section");
      throw error;
    }
  }, [duplicateSection, loadPageSections, pageId, pageSections]);

  const handleDeleteSection = useCallback(async (sectionId: string) => {
    try {
      await deleteSection.mutateAsync(sectionId);
      toast.success("Section deleted successfully");
      // Remove from local state immediately
      setPageSections((prev) => prev.filter((s) => s.id !== sectionId));
      // The useSections hook will automatically refetch due to query invalidation
    } catch (error: any) {
      console.error("Error deleting section:", error);
      toast.error(error.message || "Failed to delete section");
      throw error;
    }
  }, [deleteSection]);

  const handleUpdateStatus = async (id: string, newStatus: "published" | "draft" | "deactivated") => {
    const section = pageSections.find((s) => s.id === id);
    if (!section?.page_section_id) return;

    const oldStatus = section.status;
    
    // Optimistic update
    setPageSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: newStatus } : s))
    );

    try {
      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      const response = await fetch(
        `/api/admin/pages/${pageId}/sections/${section.page_section_id}`,
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
      setPageSections((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status: oldStatus } : s))
      );
    }
  };

  const handleReorder = useCallback(async (orderedItems: PageSection[]) => {
    if (searchQuery.trim()) {
      toast.info("Clear the search to reorder sections.");
      return;
    }

    const newOrder = orderedItems.map((item, index) => ({ ...item, position: index }));

    let previousItems: PageSection[] = [];
    setPageSections((prev) => {
      previousItems = prev;
      return newOrder;
    });

    const toastId = toast.loading("Saving order...");

    try {
      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      const response = await fetch(`/api/admin/pages/${pageId}/sections/reorder`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({
          items: newOrder.map(({ page_section_id, position }) => ({
            id: page_section_id,
            position,
          })),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to reorder sections");
      }

      toast.success("Sections reordered successfully", { id: toastId });
    } catch (error: any) {
      console.error("Error reordering sections:", error);
      toast.error(error.message || "Failed to reorder sections", { id: toastId });
      setPageSections(previousItems);
    }
  }, [pageId, searchQuery]);

  const renderContent = useCallback((section: PageSection) => (
    <div className="flex items-center gap-3">
      <div className="h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 bg-primary/10">
        <IconFromClass
          iconClass={(section as any).icon}
          fallbackIcon={faLayerGroup}
          className="h-5 w-5 text-primary"
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-2">
          <Link
            href={`/admin/sections/${section.id}?pageId=${pageId}`}
            className="font-semibold text-sm line-clamp-1 hover:text-primary transition-colors cursor-pointer"
          >
            {section.admin_title || section.title || section.type}
          </Link>
          <PageSectionStatusSelector
            status={section.status}
            onStatusChange={(newStatus) => handleUpdateStatus(section.id, newStatus)}
          />
        </div>
        {section.type && (
          <p className="text-xs text-muted-foreground">
            {section.type}
          </p>
        )}
      </div>
    </div>
  ), [pageId]);

  const renderActions = useCallback((section: PageSection) => (
    <ActionMenu
      itemId={section.id}
      editHref={`/admin/sections/${section.id}?pageId=${pageId}&tab=edit`}
      onDelete={async () => {
        await handleDeleteSection(section.id);
      }}
      onDuplicate={async () => {
        await handleDuplicate(section.id);
      }}
      deleteLabel="this section"
      customActions={[
        {
          label: "Deselect",
          icon: <FontAwesomeIcon icon={faX} className="h-4 w-4" />,
          onClick: async () => {
            await handleRemoveSection(section.id);
          },
        },
      ]}
    />
  ), [pageId, handleDeleteSection, handleDuplicate, handleRemoveSection]);

  // Filter sections based on search
  const filteredPageSections = pageSections.filter((section) => {
    if (!debouncedSearch.trim()) return true;
    const query = debouncedSearch.toLowerCase();
    return (
      (section.title || "").toLowerCase().includes(query) ||
      (section.admin_title || "").toLowerCase().includes(query) ||
      (section.type || "").toLowerCase().includes(query)
    );
  });

  const selectedSectionIds = pageSections.map((s) => s.id);
  const unselectedSections = allSections.filter((s) => !selectedSectionIds.includes(s.id));

  // Filter unselected sections based on search
  const filteredUnselectedSections = unselectedSections.filter((section) => {
    if (!debouncedSearch.trim()) return true;
    const query = debouncedSearch.toLowerCase();
    return (
      (section.title || "").toLowerCase().includes(query) ||
      (section.admin_title || "").toLowerCase().includes(query) ||
      (section.type || "").toLowerCase().includes(query)
    );
  });

  // Debug logging for section filtering
  useEffect(() => {
    console.log("🔍 [PageSectionsList] Section Filtering Debug:", {
      allSectionsLength: allSections.length,
      allSectionsIds: allSections.map(s => s.id),
      selectedSectionIds,
      unselectedSectionsLength: unselectedSections.length,
      unselectedSectionsIds: unselectedSections.map(s => s.id),
      filteredUnselectedSectionsLength: filteredUnselectedSections.length,
      filteredUnselectedSectionsIds: filteredUnselectedSections.map(s => s.id),
      debouncedSearch,
    });
  }, [allSections, selectedSectionIds, unselectedSections, filteredUnselectedSections, debouncedSearch]);

  return (
    <div className="w-full">
      {!hideHeader && (
        <div className="mb-6 md:mb-8">
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-3 mb-2">
              <h1 className="text-4xl font-bold text-foreground leading-none">
                Sections - {pageTitle}
              </h1>
              <span className="inline-flex items-center justify-center h-5 px-2.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 leading-none">
                ({pageSections.length} {pageSections.length === 1 ? "section" : "sections"})
              </span>
            </div>
            <p className="text-base text-muted-foreground">
              Manage and organize sections for this page. Drag to reorder, toggle visibility.
            </p>
          </div>
        </div>
      )}
      <div className="space-y-4">
        <AdminToolbar
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search sections..."
        >
          <Button
            asChild
            variant="ghost"
            className="rounded-full w-10 h-10 p-0 bg-transparent text-muted-foreground hover:text-primary hover:bg-transparent border-0 shadow-none transition-colors"
            title="New Section"
          >
            <Link href={`/admin/sections/new?page_id=${pageId}`}>
              <FontAwesomeIcon icon={faPlus} className="h-5 w-5" />
            </Link>
          </Button>
        </AdminToolbar>

        {/* Connected Sections */}
        {filteredPageSections.length > 0 && (
          <div className="space-y-4 mb-6">
            <h3 className="text-lg font-semibold">Connected Sections</h3>
            <SortableCardList
              items={filteredPageSections}
              onReorder={handleReorder}
              renderContent={renderContent}
              renderActions={renderActions}
            />
          </div>
        )}

        {/* Available Sections */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">
              {pageSections.length > 0 ? "Other Sections" : "Available Sections"}
            </h3>
            <p className="text-sm text-muted-foreground">
              Click the action menu to add sections to this page
            </p>
          </div>
          {filteredUnselectedSections.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground border rounded-lg">
              {pageSections.length > 0
                ? "No other sections available"
                : "No sections available. Create one to get started."}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredUnselectedSections.map((section) => (
                <div
                  key={section.id}
                  className="group relative bg-card border rounded-lg p-4 transition-all hover:border-primary/50 hover:shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 bg-muted">
                      <IconFromClass
                        iconClass={(section as any).icon}
                        fallbackIcon={faLayerGroup}
                        className="h-5 w-5 text-muted-foreground"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <Link
                          href={`/admin/sections/${section.id}?tab=edit`}
                          className="font-semibold text-sm line-clamp-1 hover:text-primary transition-colors cursor-pointer"
                        >
                          {section.admin_title || section.title || section.type}
                        </Link>
                        <ActionMenu
                          itemId={section.id}
                          editHref={`/admin/sections/${section.id}/edit`}
                          onDelete={async () => {
                            await handleDeleteSection(section.id);
                          }}
                          onDuplicate={async () => {
                            await handleDuplicate(section.id);
                          }}
                          deleteLabel="this section"
                          customActions={[
                            {
                              label: "Select",
                              icon: <FontAwesomeIcon icon={faCheck} className="h-4 w-4" />,
                              onClick: async () => {
                                await handleAddSection(section.id);
                              },
                            },
                          ]}
                        />
                      </div>
                      {section.type && (
                        <p className="text-xs text-muted-foreground">
                          {section.type}
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
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { CardList } from "@/components/admin/CardList";
import { ActionMenu } from "@/components/admin/ActionMenu";
import { AdminToolbar } from "@/components/admin/AdminToolbar";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faLayerGroup } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIconFromClass } from "@/components/admin/FontAwesomeIconFromClass";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useDebounce } from "@/hooks/use-debounce";
import { useSections, useDeleteSection, useDuplicateSection } from "@/lib/react-query/hooks";
import type { SectionWithPages } from "../types";

type SectionsListProps = {
  initialSections: SectionWithPages[];
};

export function SectionsList({ initialSections }: SectionsListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);
  const router = useRouter();

  // Use React Query hook with server-side search
  // Note: API returns Section[] but we need SectionWithPages[], so we merge pages data from initialSections
  const { data: sectionsData = [], isLoading, error } = useSections(
    { search: debouncedSearch || undefined },
    { initialData: initialSections }
  );
  const deleteSection = useDeleteSection();
  const duplicateSection = useDuplicateSection();

  const handleDuplicate = async (id: string) => {
    try {
      const duplicated = await duplicateSection.mutateAsync(id);
      toast.success("Section duplicated successfully");
      // Redirect to edit page of duplicated section
      router.push(`/admin/sections/${duplicated.id}/edit`);
    } catch (error: any) {
      console.error("Error duplicating section:", error);
      toast.error(error.message || "Failed to duplicate section");
      throw error;
    }
  };

  // Merge pages data from initialSections when available (for search results that don't include pages)
  const sections: SectionWithPages[] = sectionsData.map((section) => {
    const initialSection = initialSections.find((s) => s.id === section.id);
    return {
      ...section,
      pages: initialSection?.pages || [],
    } as SectionWithPages;
  });

  const handleDelete = async (id: string) => {
    try {
      await deleteSection.mutateAsync(id);
      toast.success("Section deleted successfully");
    } catch (error: any) {
      console.error("Error deleting section:", error);
      toast.error(error.message || "Failed to delete section");
      throw error;
    }
  };


  return (
    <div className="w-full">
        <div className="mb-6 md:mb-8">
          <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-3 mb-2">
            <h1 className="text-4xl font-bold text-foreground leading-none">Sections</h1>
            <span className="inline-flex items-center justify-center h-5 px-2.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 leading-none">
              ({sections.length} {sections.length === 1 ? "section" : "sections"})
            </span>
          </div>
          <p className="text-base text-muted-foreground">
            Manage and organize your site sections, including their content and visibility.
          </p>
        </div>
      </div>
      <div className="space-y-3 md:space-y-4">
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
            <Link href="/admin/sections/new">
              <FontAwesomeIcon icon={faPlus} className="h-5 w-5" />
            </Link>
          </Button>
        </AdminToolbar>

        {isLoading && !sections.length ? (
          <div className="rounded-xl border border-dashed border-border/60 bg-muted/30 p-8 text-center text-muted-foreground">
            Loading sections...
          </div>
        ) : error ? (
          <div className="rounded-xl border border-dashed border-border/60 bg-muted/30 p-8 text-center text-muted-foreground">
            Error loading sections. Please try again.
          </div>
        ) : sections.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/60 bg-muted/30 p-8 text-center text-muted-foreground">
            {searchQuery
              ? "No sections found matching your search"
              : "No sections found"}
          </div>
        ) : (
          <div className="space-y-2">
            <CardList
              items={sections}
              renderContent={(section) => (
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full overflow-hidden flex items-center justify-center shadow-md flex-shrink-0 bg-muted">
                    <FontAwesomeIconFromClass
                      iconClass={(section as any).icon}
                      fallbackIcon={faLayerGroup}
                      className="h-6 w-6 !text-primary"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/admin/sections/${section.id}/edit`}
                      className="text-base font-semibold text-foreground leading-snug hover:text-primary transition-colors cursor-pointer"
                    >
                      {section.admin_title || section.title || section.type}
                    </Link>
                  </div>
                </div>
              )}
              renderActions={(section) => (
                <ActionMenu
                  itemId={section.id}
                  editHref={`/admin/sections/${section.id}/edit`}
                  onDelete={handleDelete}
                  onDuplicate={handleDuplicate}
                  deleteLabel={`section "${section.admin_title || section.title || section.type}"`}
                />
              )}
            />
          </div>
        )}
      </div>
    </div>
  );
}

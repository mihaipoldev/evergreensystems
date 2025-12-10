"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useCreatePage, useUpdatePage } from "@/lib/react-query/hooks";
import { Button } from "@/components/ui/button";
import { InputShadow } from "@/components/admin/forms/InputShadow";
import { TextareaShadow } from "@/components/admin/forms/TextareaShadow";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGripVertical, faLayerGroup, faTimes } from "@fortawesome/free-solid-svg-icons";
import type { Page } from "../types";

const formSchema = z.object({
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

type PageFormProps = {
  initialData?: Page | null;
  isEdit?: boolean;
};

type PageSectionItem = {
  id: string;
  section_id: string;
  title: string | null;
  admin_title: string | null;
  type: string;
  position: number;
  visible: boolean;
  page_section_id?: string;
};

type SectionCardProps = {
  section: PageSectionItem;
  onToggleVisible: (id: string) => void;
  onRemove: (id: string) => void;
};

// Sortable section card component
function SectionCard({ section, onToggleVisible, onRemove }: SectionCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-4 rounded-lg bg-muted/50 border border-border group"
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="h-10 flex items-center justify-center cursor-grab active:cursor-grabbing touch-none"
      >
        <FontAwesomeIcon
          icon={faGripVertical}
          className="h-5 w-5 text-muted-foreground"
        />
      </div>

      {/* Section icon */}
      <div className="h-10 w-10 rounded-full overflow-hidden flex items-center justify-center bg-background shadow-sm flex-shrink-0">
        <FontAwesomeIcon
          icon={faLayerGroup}
          className="h-5 w-5 text-muted-foreground"
        />
      </div>

      {/* Section title with remove button */}
      <div className="flex-1 min-w-0 flex items-center gap-2">
        <div className="flex-1 min-w-0">
          <a
            href={`/admin/sections/${section.section_id}/edit`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-sm truncate inline-block text-foreground hover:text-primary transition-colors duration-200 cursor-pointer leading-tight"
            onClick={(e) => e.stopPropagation()}
            title="Edit section in new tab"
          >
            {section.admin_title || section.title || section.type}
          </a>
          <div className="text-xs text-muted-foreground -mt-0.5 leading-tight">
            Type: {section.type}
          </div>
        </div>

        {/* Visibility switch */}
        <div className="flex items-center flex-shrink-0">
          <Switch
            checked={section.visible}
            onCheckedChange={() => onToggleVisible(section.id)}
          />
        </div>

        {/* Remove button */}
        <button
          type="button"
          className="flex items-center justify-center h-7 w-7 rounded-md text-muted-foreground hover:text-destructive transition-colors duration-200 flex-shrink-0"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(section.id);
          }}
          title="Remove section from page"
        >
          <FontAwesomeIcon
            icon={faTimes}
            className="h-4 w-4"
          />
        </button>
      </div>
    </div>
  );
}

export function PageForm({ initialData, isEdit = false }: PageFormProps) {
  const router = useRouter();
  const createPage = useCreatePage();
  const updatePage = useUpdatePage();
  const [pageSections, setPageSections] = useState<PageSectionItem[]>([]);
  const [availableSections, setAvailableSections] = useState<PageSectionItem[]>([]);
  const [isLoadingSections, setIsLoadingSections] = useState(false);
  const [showSectionSelect, setShowSectionSelect] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      slug: initialData?.slug || "",
      title: initialData?.title || "",
      description: initialData?.description || "",
    },
  });

  // Setup drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Fetch sections on mount (only in edit mode)
  useEffect(() => {
    if (isEdit && initialData?.id) {
      fetchSections();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, initialData?.id]);

  const fetchSections = async () => {
    if (!initialData?.id) return;

    setIsLoadingSections(true);
    try {
      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      // Fetch current page sections
      const pageSectionsResponse = await fetch(
        `/api/admin/sections?page_id=${initialData.id}`,
        {
          headers: {
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          },
        }
      );

      if (!pageSectionsResponse.ok) {
        throw new Error("Failed to fetch page sections");
      }

      const pageSectionsData = await pageSectionsResponse.json();
      
      // Debug: Log the API response to check visible values
      console.log("Page sections data from API:", pageSectionsData.map((ps: any) => ({
        id: ps.id,
        visible: ps.visible,
        visibleType: typeof ps.visible
      })));

      // Fetch all sections
      const allSectionsResponse = await fetch("/api/admin/sections", {
        headers: {
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
      });

      if (!allSectionsResponse.ok) {
        throw new Error("Failed to fetch all sections");
      }

      const allSectionsData = await allSectionsResponse.json();

      // Transform page sections data
      const transformedPageSections = pageSectionsData.map((ps: any) => {
        // Ensure visible is a proper boolean
        let visibleValue = true;
        if (ps.visible !== undefined && ps.visible !== null) {
          if (typeof ps.visible === 'boolean') {
            visibleValue = ps.visible;
          } else if (typeof ps.visible === 'string') {
            visibleValue = ps.visible.toLowerCase() === 'true';
          } else {
            visibleValue = Boolean(ps.visible);
          }
        }
        
        return {
          id: ps.id,
          section_id: ps.id,
          title: ps.title,
          admin_title: ps.admin_title,
          type: ps.type,
          position: ps.position ?? 0,
          visible: visibleValue,
          page_section_id: ps.page_section_id,
        };
      });

      setPageSections(transformedPageSections);
      setAvailableSections(allSectionsData);
    } catch (error) {
      console.error("Error fetching sections:", error);
      toast.error("Failed to load sections");
    } finally {
      setIsLoadingSections(false);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setPageSections((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        const newItems = arrayMove(items, oldIndex, newIndex);
        // Update positions
        return newItems.map((item, index) => ({
          ...item,
          position: index,
        }));
      });
    }
  };

  const handleToggleVisible = (id: string) => {
    setPageSections((items) =>
      items.map((item) =>
        item.id === id ? { ...item, visible: !item.visible } : item
      )
    );
  };

  const handleAddSection = (sectionId: string) => {
    // Handle "Create New Section" option
    if (sectionId === "__create_new__") {
      setShowSectionSelect(false);
      window.open("/admin/sections/new", "_blank");
      return;
    }

    const sectionToAdd = availableSections.find((s) => s.id === sectionId);
    if (!sectionToAdd) return;

    // Check if section is already added
    if (pageSections.some((s) => s.section_id === sectionToAdd.id)) {
      toast.error("Section already added");
      return;
    }

    const newSection: PageSectionItem = {
      id: sectionToAdd.id,
      section_id: sectionToAdd.id,
      title: sectionToAdd.title,
      admin_title: sectionToAdd.admin_title,
      type: sectionToAdd.type,
      position: pageSections.length,
      visible: true,
    };

    setPageSections([...pageSections, newSection]);
    setShowSectionSelect(false);
  };

  const handleRemoveSection = (id: string) => {
    setPageSections(pageSections.filter((s) => s.id !== id));
  };

  const onSubmit = async (values: FormValues) => {
    try {
      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      // Use React Query mutation
      if (isEdit && initialData) {
        await updatePage.mutateAsync({
          id: initialData.id,
          data: values,
        });
      } else {
        await createPage.mutateAsync(values);
      }

      // If in edit mode and sections were modified, update sections
      if (isEdit && initialData?.id) {
        const sectionsPayload = pageSections.map((section) => ({
          section_id: section.section_id,
          position: section.position,
          visible: section.visible,
        }));

        const sectionsResponse = await fetch(
          `/api/admin/pages/${initialData.id}/sections`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
            },
            body: JSON.stringify({ sections: sectionsPayload }),
          }
        );

        if (!sectionsResponse.ok) {
          const error = await sectionsResponse.json();
          throw new Error(error.error || "Failed to update page sections");
        }
      }

      toast.success(`Page ${isEdit ? "updated" : "created"} successfully`);
      router.push("/admin/pages");
      router.refresh();
    } catch (error: any) {
      console.error("Error saving page:", error);
      toast.error(error.message || `Failed to ${isEdit ? "update" : "create"} page`);
    }
  };

  const isSubmitting = createPage.isPending || updatePage.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
        <div className="rounded-xl bg-card text-card-foreground shadow-lg p-6 md:p-8 space-y-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-1">Details</h3>
              <p className="text-sm text-muted-foreground">
                Basic information about the page
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Title <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <InputShadow placeholder="Enter page title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Slug <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <InputShadow placeholder="my-page-slug" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <TextareaShadow
                    placeholder="Enter page description"
                    style={{ minHeight: '100px' }}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Sections Management - Only in Edit Mode */}
          {isEdit && initialData?.id && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-1">Sections</h3>
                <p className="text-sm text-muted-foreground">
                  Drag to reorder, toggle to show/hide sections on this page
                </p>
              </div>

              {isLoadingSections ? (
                <div className="text-sm text-muted-foreground">Loading sections...</div>
              ) : (
                <>
                  {/* Section Cards with Drag and Drop */}
                  {pageSections.length > 0 ? (
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleDragEnd}
                    >
                      <SortableContext
                        items={pageSections.map((s) => s.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        <div className="space-y-2">
                          {pageSections.map((section) => (
                            <SectionCard
                              key={section.id}
                              section={section}
                              onToggleVisible={handleToggleVisible}
                              onRemove={handleRemoveSection}
                            />
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>
                  ) : (
                    <div className="text-sm text-muted-foreground py-4 text-center border border-dashed border-border rounded-lg">
                      No sections added yet. Use the dropdown below to add sections.
                    </div>
                  )}

                  {/* Add Section Dropdown */}
                  <div>
                    <Select 
                      open={showSectionSelect}
                      onOpenChange={setShowSectionSelect}
                      onValueChange={handleAddSection}
                    >
                      <SelectTrigger className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm data-[placeholder]:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 !shadow-[0px_1px_1px_0px_rgba(16,17,26,0.08)] dark:!shadow-[0px_1px_1px_0px_rgba(255,255,255,0.08)] hover:!shadow-[0px_1px_1px_0px_rgba(16,17,26,0.16)] dark:hover:!shadow-[0px_1px_1px_0px_rgba(255,255,255,0.12)] hover:border-foreground/30">
                        <SelectValue placeholder="Add Section" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableSections
                          .filter(
                            (section) =>
                              !pageSections.some(
                                (ps) => ps.section_id === section.id
                              )
                          )
                          .map((section) => (
                            <SelectItem key={section.id} value={section.id}>
                              {section.admin_title || section.title || section.type}
                            </SelectItem>
                          ))}
                        <SelectItem value="__create_new__" className="text-primary font-medium">
                          + Create New Section
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center justify-end gap-4 mt-6">
          <Button
            type="button"
            variant="outline"
            className="bg-card hover:bg-card/80 h-11 px-6 md:h-10 md:px-4"
            asChild
            disabled={isSubmitting}
          >
            <Link href="/admin/pages">Cancel</Link>
          </Button>
          <Button type="submit" disabled={isSubmitting} className="h-11 px-6 md:h-10 md:px-4">
            {isSubmitting ? "Saving..." : isEdit ? "Update Page" : "Create Page"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

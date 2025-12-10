"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { InputShadow } from "@/components/admin/forms/InputShadow";
import { TextareaShadow } from "@/components/admin/forms/TextareaShadow";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { VideoUploadField } from "@/components/admin/forms/VideoUploadField";
import { MediaForm } from "@/features/media/components/MediaForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTrash, faArrowUp, faArrowDown, faImage, faVideo, faFile, faCheck, faPlay, faMousePointer, faLink } from "@fortawesome/free-solid-svg-icons";
import { MediaRenderer } from "@/components/MediaRenderer";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { CTAButtonForm } from "@/features/cta/components/CTAButtonForm";
import type { Section } from "../types";
import type { MediaWithSection } from "@/features/media/types";
import type { Media } from "@/features/media/types";
import type { CTAButtonWithSection } from "@/features/cta/types";
import type { CTAButton } from "@/features/cta/types";

// Lazy load lightweight code editor for JSON content (no SSR)
const CodeEditor = dynamic(() => import("@uiw/react-textarea-code-editor"), { ssr: false });

const formSchema = z.object({
  type: z.string().min(1, "Type is required"),
  title: z.string().optional(),
  admin_title: z.string().optional(),
  subtitle: z.string().optional(),
  content: z.string().optional(),
  media_url: z.union([z.string().url("Must be a valid URL"), z.literal(""), z.null()]).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type SectionFormProps = {
  initialData?: Section | null;
  isEdit?: boolean;
};

// Common section types
const SECTION_TYPES = [
  "hero",
  "header",
  "logos",
  "features",
  "testimonials",
  "faq",
  "cta",
  "results",
  "stories",
  "content",
  "gallery",
  "pricing",
  "contact",
  "about",
  "footer",
];

export function SectionForm({ initialData, isEdit = false }: SectionFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [sectionMedia, setSectionMedia] = useState<MediaWithSection[]>(initialData?.media || []);
  const [isAddMediaDialogOpen, setIsAddMediaDialogOpen] = useState(false);
  const [allMedia, setAllMedia] = useState<Media[]>([]);
  const [showMediaList, setShowMediaList] = useState(false);
  const [previewMedia, setPreviewMedia] = useState<MediaWithSection | null>(null);
  const [sectionCTAButtons, setSectionCTAButtons] = useState<CTAButtonWithSection[]>(initialData?.ctaButtons || []);
  const [isAddCTADialogOpen, setIsAddCTADialogOpen] = useState(false);
  const [allCTAButtons, setAllCTAButtons] = useState<CTAButton[]>([]);
  const [showCTAButtonList, setShowCTAButtonList] = useState(false);

  // Parse content JSON if it exists
  const parseContent = (content: any): string => {
    if (!content) return "";
    if (typeof content === "string") return content;
    try {
      return JSON.stringify(content, null, 2);
    } catch {
      return "";
    }
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: initialData?.type || "",
      title: initialData?.title || "",
      admin_title: initialData?.admin_title || "",
      subtitle: initialData?.subtitle || "",
      content: parseContent(initialData?.content),
      media_url: initialData?.media_url || "",
    },
  });

  const sectionType = form.watch("type");

  // Load section media when editing
  useEffect(() => {
    if (isEdit && initialData?.id) {
      loadSectionMedia(initialData.id);
    }
  }, [isEdit, initialData?.id]);

  // Load all media for selection
  useEffect(() => {
    if (isEdit && initialData?.id) {
      loadAllMedia();
    }
  }, [isEdit, initialData?.id]);

  // Load section CTA buttons when editing
  useEffect(() => {
    if (isEdit && initialData?.id && (sectionType === "cta" || sectionType === "hero" || sectionType === "header")) {
      loadSectionCTAs(initialData.id);
    }
  }, [isEdit, initialData?.id, sectionType]);

  // Load all CTA buttons for selection
  useEffect(() => {
    if (isEdit && initialData?.id && (sectionType === "cta" || sectionType === "hero" || sectionType === "header")) {
      loadAllCTAButtons();
    }
  }, [isEdit, initialData?.id, sectionType]);

  const loadAllMedia = async () => {
    try {
      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      const response = await fetch("/api/admin/media", {
        headers: {
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
      });

      if (response.ok) {
        const media = await response.json();
        setAllMedia(media);
      }
    } catch (error) {
      console.error("Error loading all media:", error);
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
        setAllCTAButtons((ctaButtons || []).filter((btn: CTAButton) => btn.status === "active"));
      }
    } catch (error) {
      console.error("Error loading all CTA buttons:", error);
    }
  };

  const loadSectionMedia = async (sectionId: string) => {
    try {
      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      const response = await fetch(`/api/admin/sections/${sectionId}/media`, {
        headers: {
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
      });

      if (response.ok) {
        const media = await response.json();
        setSectionMedia(media);
      }
    } catch (error) {
      console.error("Error loading section media:", error);
    }
  };

  // Clear media_url when type changes away from hero
  useEffect(() => {
    if (sectionType !== "hero") {
      form.setValue("media_url", "");
      setSelectedFile(null);
    }
  }, [sectionType, form]);

  const validateMediaUrl = async (url: string): Promise<{ valid: boolean; error?: string }> => {
    try {
      // For videos, we'll do a basic URL validation
      // The actual file validation will happen on upload
      try {
        new URL(url);
        return { valid: true };
      } catch {
        return { valid: false, error: "Invalid URL format" };
      }
    } catch (error: any) {
      return { valid: false, error: error.message || "Failed to validate media URL" };
    }
  };

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      // Parse content JSON if provided
      let parsedContent = null;
      if (values.content && values.content.trim()) {
        try {
          parsedContent = JSON.parse(values.content);
        } catch (e) {
          throw new Error("Invalid JSON in content field");
        }
      }

      let mediaUrl = values.media_url?.trim() || null;
      // Normalize existing URL to ensure it has protocol (only if not empty)
      if (mediaUrl && mediaUrl !== "" && !mediaUrl.startsWith("http://") && !mediaUrl.startsWith("https://")) {
        mediaUrl = `https://${mediaUrl}`;
      }
      // Ensure empty strings become null
      if (mediaUrl === "") {
        mediaUrl = null;
      }
      const oldMediaUrl = initialData?.media_url || null;

      // Handle file upload (only for hero sections)
      if (selectedFile && values.type === "hero") {
        const folderPath = isEdit && initialData
          ? `sections/${initialData.id}`
          : "sections/temp";

        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("folderPath", folderPath);

        const uploadResponse = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadResponse.ok) {
          const error = await uploadResponse.json();
          throw new Error(error.error || "Failed to upload media");
        }

        const uploadData = await uploadResponse.json();
        mediaUrl = uploadData.url;
        // Ensure URL has protocol
        if (mediaUrl && !mediaUrl.startsWith("http://") && !mediaUrl.startsWith("https://")) {
          mediaUrl = `https://${mediaUrl}`;
        }

        // If this is a new section, the file is in temp folder
        // We'll move it after creating the section
      } else if (mediaUrl && mediaUrl !== oldMediaUrl && values.type === "hero") {
        // Validate URL if it's a new URL
        const validation = await validateMediaUrl(mediaUrl);
        if (!validation.valid) {
          throw new Error(validation.error || "Invalid media URL");
        }
      }

      // Only include media_url if type is hero
      const payload: any = {
        type: values.type,
        title: values.title || null,
        admin_title: values.admin_title || null,
        subtitle: values.subtitle || null,
        content: parsedContent,
      };

      if (values.type === "hero") {
        payload.media_url = mediaUrl;
      } else {
        // Clear media_url if type is not hero
        payload.media_url = null;
      }

      const url = isEdit && initialData
        ? `/api/admin/sections/${initialData.id}`
        : "/api/admin/sections";
      const method = isEdit ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Failed to ${isEdit ? "update" : "create"} section`);
      }

      const sectionData = await response.json();
      const sectionId = sectionData.id || initialData?.id;

      // Save section media relationships if in edit mode
      if (isEdit && sectionId) {
        await saveSectionMedia(sectionId, sectionMedia, accessToken);
      }

      // Save section CTA buttons if editing and section type is CTA, Hero, or Header
      if (isEdit && sectionId && (sectionType === "cta" || sectionType === "hero" || sectionType === "header")) {
        await saveSectionCTAs(sectionId, sectionCTAButtons, accessToken);
      }

      // Move file from temp to permanent folder if this was a new section
      if (selectedFile && !isEdit && mediaUrl && values.type === "hero") {
        const tempFolderPath = "sections/temp";
        const permanentFolderPath = `sections/${sectionId}`;

        // Extract filename from URL
        const urlParts = mediaUrl.split("/");
        const filename = urlParts[urlParts.length - 1];
        const tempPath = `${tempFolderPath}/${filename}`;

        // Move the file
        const moveResponse = await fetch("/api/admin/upload/move", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageUrl: mediaUrl,
            newFolderPath: `${permanentFolderPath}/${filename}`,
          }),
        });

        if (moveResponse.ok) {
          const moveData = await moveResponse.json();
          mediaUrl = moveData.url;
          // Ensure URL has protocol
          if (mediaUrl && !mediaUrl.startsWith("http://") && !mediaUrl.startsWith("https://")) {
            mediaUrl = `https://${mediaUrl}`;
          }

          // Update section with new URL
          if (sectionId) {
            await fetch(`/api/admin/sections/${sectionId}`, {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
              },
              body: JSON.stringify({ media_url: mediaUrl }),
            });
          }
        }
      }

      toast.success(`Section ${isEdit ? "updated" : "created"} successfully`);
      router.push("/admin/sections");
      router.refresh();
    } catch (error: any) {
      console.error("Error saving section:", error);
      toast.error(error.message || `Failed to ${isEdit ? "update" : "create"} section`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const saveSectionMedia = async (
    sectionId: string,
    media: MediaWithSection[],
    accessToken?: string
  ) => {
    try {
      // Get current media from API
      const currentResponse = await fetch(`/api/admin/sections/${sectionId}/media`, {
        headers: {
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
      });

      if (!currentResponse.ok) return;

      const currentMedia = await currentResponse.json();
      const currentMediaIds = new Set(currentMedia.map((m: MediaWithSection) => m.id));
      const newMediaIds = new Set(media.map((m) => m.id));

      // Remove media that are no longer in the list
      for (const currentItem of currentMedia) {
        if (!newMediaIds.has(currentItem.id)) {
          await fetch(`/api/admin/sections/${sectionId}/media?section_media_id=${currentItem.section_media.id}`, {
            method: "DELETE",
            headers: {
              ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
            },
          });
        }
      }

      // Add new media and update existing ones
      for (let i = 0; i < media.length; i++) {
        const item = media[i];
        const sortOrder = i + 1;

        if (currentMediaIds.has(item.id)) {
          // Update existing
          const existingItem = currentMedia.find((m: MediaWithSection) => m.id === item.id);
          if (existingItem && (existingItem.section_media.sort_order !== sortOrder || existingItem.section_media.role !== item.section_media.role)) {
            await fetch(`/api/admin/sections/${sectionId}/media`, {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
              },
              body: JSON.stringify({
                section_media_id: existingItem.section_media.id,
                role: item.section_media.role,
                sort_order: sortOrder,
              }),
            });
          }
        } else {
          // Add new
          await fetch(`/api/admin/sections/${sectionId}/media`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
            },
            body: JSON.stringify({
              media_id: item.id,
              role: item.section_media.role,
              sort_order: sortOrder,
            }),
          });
        }
      }
    } catch (error) {
      console.error("Error saving section media:", error);
    }
  };

  const handleAddExistingMedia = (mediaId: string) => {
    if (!isEdit || !initialData?.id) {
      toast.error("Please save the section first before adding media");
      return;
    }

    const media = allMedia.find((m) => m.id === mediaId);
    if (!media) return;

    // Check if already added
    if (sectionMedia.some((m) => m.id === mediaId)) {
      toast.error("This media is already added to the section");
      return;
    }

    const newMediaItem: MediaWithSection = {
      ...media,
      section_media: {
        id: "",
        role: "main",
        sort_order: sectionMedia.length + 1,
        created_at: new Date().toISOString(),
      },
    };

    setSectionMedia([...sectionMedia, newMediaItem]);
    setShowMediaList(false);
  };

  const handleNewMediaCreated = async (newMedia: Media) => {
    setIsAddMediaDialogOpen(false);
    await loadAllMedia();
    
    // Automatically add the newly created media to the section
    if (isEdit && initialData?.id) {
      try {
        const supabase = createClient();
        const { data: sessionData } = await supabase.auth.getSession();
        const accessToken = sessionData?.session?.access_token;

        // Create the section_media relationship immediately
        const response = await fetch(`/api/admin/sections/${initialData.id}/media`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          },
          body: JSON.stringify({
            media_id: newMedia.id,
            role: "main",
            sort_order: sectionMedia.length + 1,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to add media to section");
        }

        const mediaWithMetadata = await response.json();
        
        // Update local state
        setSectionMedia([...sectionMedia, mediaWithMetadata]);
        toast.success("Media created and added to section successfully.");
      } catch (error: any) {
        console.error("Error adding media to section:", error);
        toast.error(error.message || "Failed to add media to section");
      }
    } else {
      toast.success("Media created successfully. You can now add it to the section.");
    }
  };

  const handleRemoveMedia = (mediaId: string) => {
    setSectionMedia(sectionMedia.filter((m) => m.id !== mediaId));
  };

  const handleMoveMedia = (index: number, direction: "up" | "down") => {
    const newMedia = [...sectionMedia];
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex >= 0 && newIndex < newMedia.length) {
      [newMedia[index], newMedia[newIndex]] = [newMedia[newIndex], newMedia[index]];
      // Update sort_order
      newMedia.forEach((item, i) => {
        item.section_media.sort_order = i + 1;
      });
      setSectionMedia(newMedia);
    }
  };

  const handleRoleChange = (mediaId: string, role: string) => {
    setSectionMedia(
      sectionMedia.map((m) =>
        m.id === mediaId
          ? { ...m, section_media: { ...m.section_media, role } }
          : m
      )
    );
  };

  const getMediaIcon = (type: string, sourceType: string) => {
    if (sourceType === "wistia" || sourceType === "youtube" || sourceType === "vimeo") {
      return faVideo;
    }
    if (type === "image") return faImage;
    if (type === "video") return faVideo;
    return faFile;
  };

  const loadSectionCTAs = async (sectionId: string) => {
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

  const saveSectionCTAs = async (
    sectionId: string,
    ctaButtons: CTAButtonWithSection[],
    accessToken?: string
  ) => {
    try {
      // Get current CTAs from API
      const currentResponse = await fetch(`/api/admin/sections/${sectionId}/cta-buttons`, {
        headers: {
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
      });

      if (!currentResponse.ok) return;

      const currentCTAs = await currentResponse.json();
      const currentCTAIds = new Set(currentCTAs.map((c: CTAButtonWithSection) => c.id));
      const newCTAIds = new Set(ctaButtons.map((c) => c.id));

      // Remove CTAs that are no longer in the list
      for (const currentItem of currentCTAs) {
        if (!newCTAIds.has(currentItem.id)) {
          await fetch(`/api/admin/sections/${sectionId}/cta-buttons?section_cta_button_id=${currentItem.section_cta_button.id}`, {
            method: "DELETE",
            headers: {
              ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
            },
          });
        }
      }

      // Add new CTAs and update existing ones
      for (let i = 0; i < ctaButtons.length; i++) {
        const item = ctaButtons[i];
        const position = i;

        if (currentCTAIds.has(item.id)) {
          // Update existing
          const existingItem = currentCTAs.find((c: CTAButtonWithSection) => c.id === item.id);
          if (existingItem && existingItem.section_cta_button.position !== position) {
            await fetch(`/api/admin/sections/${sectionId}/cta-buttons`, {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
              },
              body: JSON.stringify({
                section_cta_button_id: existingItem.section_cta_button.id,
                position: position,
              }),
            });
          }
        } else {
          // Add new
          await fetch(`/api/admin/sections/${sectionId}/cta-buttons`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
            },
            body: JSON.stringify({
              cta_button_id: item.id,
              position: position,
            }),
          });
        }
      }
    } catch (error) {
      console.error("Error saving section CTA buttons:", error);
    }
  };

  const handleAddExistingCTA = (ctaButtonId: string) => {
    if (!isEdit || !initialData?.id) {
      toast.error("Please save the section first before adding CTA buttons");
      return;
    }

    const ctaButton = allCTAButtons.find((c) => c.id === ctaButtonId);
    if (!ctaButton) return;

    // Check if already added
    if (sectionCTAButtons.some((c) => c.id === ctaButtonId)) {
      toast.error("This CTA button is already added to the section");
      return;
    }

    const newCTAItem: CTAButtonWithSection = {
      ...ctaButton,
      section_cta_button: {
        id: "",
        position: sectionCTAButtons.length,
        created_at: new Date().toISOString(),
      },
    };

    setSectionCTAButtons([...sectionCTAButtons, newCTAItem]);
  };

  const handleNewCTACreated = async (newCTA: CTAButton) => {
    setIsAddCTADialogOpen(false);
    await loadAllCTAButtons();
    
    // Automatically add the newly created CTA to the section
    if (isEdit && initialData?.id) {
      try {
        const supabase = createClient();
        const { data: sessionData } = await supabase.auth.getSession();
        const accessToken = sessionData?.session?.access_token;

        // Create the section_cta_buttons relationship immediately
        const response = await fetch(`/api/admin/sections/${initialData.id}/cta-buttons`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          },
          body: JSON.stringify({
            cta_button_id: newCTA.id,
            position: sectionCTAButtons.length,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to add CTA button to section");
        }

        const ctaWithMetadata = await response.json();
        
        // Update local state
        const newCTAItem: CTAButtonWithSection = {
          ...newCTA,
          section_cta_button: {
            id: ctaWithMetadata.section_cta_button?.id || "",
            position: sectionCTAButtons.length,
            created_at: new Date().toISOString(),
          },
        };
        setSectionCTAButtons([...sectionCTAButtons, newCTAItem]);
        toast.success("CTA button created and added to section successfully.");
      } catch (error: any) {
        console.error("Error adding CTA button to section:", error);
        toast.error(error.message || "Failed to add CTA button to section");
      }
    } else {
      toast.success("CTA button created successfully. You can now add it to the section.");
    }
  };

  const handleRemoveCTA = (ctaButtonId: string) => {
    setSectionCTAButtons(sectionCTAButtons.filter((c) => c.id !== ctaButtonId));
  };

  const handleMoveCTA = (index: number, direction: "up" | "down") => {
    const newCTAs = [...sectionCTAButtons];
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex >= 0 && newIndex < newCTAs.length) {
      [newCTAs[index], newCTAs[newIndex]] = [newCTAs[newIndex], newCTAs[index]];
      // Update position
      newCTAs.forEach((item, i) => {
        item.section_cta_button.position = i;
      });
      setSectionCTAButtons(newCTAs);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
        <div className="rounded-xl bg-card text-card-foreground shadow-lg p-6 md:p-8 space-y-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-1">Details</h3>
              <p className="text-sm text-muted-foreground">
                Basic information about the section
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="admin_title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Admin Title</FormLabel>
                  <FormControl>
                    <InputShadow placeholder="Enter admin title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Type <span className="text-destructive">*</span>
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-input-background">
                        <SelectValue placeholder="Select section type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {SECTION_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </SelectItem>
                      ))}
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>


          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <TextareaShadow
                    placeholder="Enter section title"
                    className="min-h-[150px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="subtitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subtitle</FormLabel>
                <FormControl>
                  <TextareaShadow
                    placeholder="Enter section subtitle"
                    className="min-h-[150px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Section Media */}
          {isEdit && initialData?.id && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-1">Media</h3>
                <p className="text-sm text-muted-foreground">
                  Add and manage media items for this section
                </p>
              </div>

              {/* Selected Media Cards */}
              {sectionMedia.length > 0 && (
                <div className="space-y-2">
                  {sectionMedia.map((item, index) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-3 border rounded-lg bg-muted/50"
                    >
                      <div className="flex-shrink-0">
                        <FontAwesomeIcon
                          icon={getMediaIcon(item.type, item.source_type)}
                          className="h-5 w-5 text-muted-foreground"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{item.name || "Untitled Media"}</div>
                        <div className="text-xs text-muted-foreground capitalize">
                          {item.type} • {item.source_type.replace("_", " ")}
                        </div>
                      </div>
                      <Select
                        value={item.section_media.role}
                        onValueChange={(role) => handleRoleChange(item.id, role)}
                      >
                        <SelectTrigger className="w-32 h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="main">Main</SelectItem>
                          <SelectItem value="story">Story</SelectItem>
                          <SelectItem value="background">Background</SelectItem>
                          <SelectItem value="gallery">Gallery</SelectItem>
                        </SelectContent>
                      </Select>
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setPreviewMedia(item)}
                          title="Preview"
                        >
                          <FontAwesomeIcon icon={faPlay} className="h-3 w-3" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleMoveMedia(index, "up")}
                          disabled={index === 0}
                        >
                          <FontAwesomeIcon icon={faArrowUp} className="h-3 w-3" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleMoveMedia(index, "down")}
                          disabled={index === sectionMedia.length - 1}
                        >
                          <FontAwesomeIcon icon={faArrowDown} className="h-3 w-3" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => handleRemoveMedia(item.id)}
                        >
                          <FontAwesomeIcon icon={faTrash} className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddMediaDialogOpen(true)}
                  className="flex-1"
                >
                  <FontAwesomeIcon icon={faPlus} className="h-4 w-4 mr-2" />
                  Add New Media
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowMediaList(!showMediaList)}
                  className="flex-1"
                >
                  {showMediaList ? "Hide" : "Select"} Existing Media
                </Button>
              </div>

              {/* Existing Media List */}
              {showMediaList && allMedia.length > 0 && (
                <div className="border rounded-lg p-4 max-h-64 overflow-y-auto space-y-2">
                  {allMedia.map((media) => {
                    const isSelected = sectionMedia.some((m) => m.id === media.id);
                    return (
                      <div
                        key={media.id}
                        className="flex items-center gap-3 p-2 hover:bg-muted rounded cursor-pointer"
                        onClick={() => !isSelected && handleAddExistingMedia(media.id)}
                      >
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => {
                            if (isSelected) {
                              handleRemoveMedia(media.id);
                            } else {
                              handleAddExistingMedia(media.id);
                            }
                          }}
                        />
                        <FontAwesomeIcon
                          icon={getMediaIcon(media.type, media.source_type)}
                          className="h-4 w-4 text-muted-foreground"
                        />
                        <span className="flex-1 text-sm font-medium">{media.name || "Untitled Media"}</span>
                        <span className="text-xs text-muted-foreground capitalize">
                          {media.type} • {media.source_type.replace("_", " ")}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Section CTA Buttons - Available for CTA, Hero, and Header sections */}
          {isEdit && initialData?.id && (sectionType === "cta" || sectionType === "hero" || sectionType === "header") && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-1">CTA Buttons</h3>
                <p className="text-sm text-muted-foreground">
                  Add and manage CTA buttons for this section
                </p>
              </div>

              {/* Selected CTA Buttons Cards */}
              {sectionCTAButtons.length > 0 && (
                <div className="space-y-2">
                  {sectionCTAButtons.map((item, index) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-3 border rounded-lg bg-muted/50"
                    >
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full flex items-center justify-center bg-muted">
                          <FontAwesomeIcon
                            icon={item.icon ? (item.icon as any) : faMousePointer}
                            className="h-5 w-5 text-muted-foreground"
                          />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{item.label}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                          <FontAwesomeIcon icon={faLink} className="h-3 w-3" />
                          <span className="truncate">{item.url}</span>
                        </div>
                        <div className="mt-1">
                          <Badge
                            variant={item.status === "active" ? "default" : "outline"}
                            className="text-xs"
                          >
                            {item.status === "active" ? "Active" : "Deactivated"}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleMoveCTA(index, "up")}
                          disabled={index === 0}
                        >
                          <FontAwesomeIcon icon={faArrowUp} className="h-3 w-3" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleMoveCTA(index, "down")}
                          disabled={index === sectionCTAButtons.length - 1}
                        >
                          <FontAwesomeIcon icon={faArrowDown} className="h-3 w-3" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => handleRemoveCTA(item.id)}
                        >
                          <FontAwesomeIcon icon={faTrash} className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddCTADialogOpen(true)}
                  className="flex-1"
                >
                  <FontAwesomeIcon icon={faPlus} className="h-4 w-4 mr-2" />
                  Add New CTA Button
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCTAButtonList(!showCTAButtonList)}
                  className="flex-1"
                >
                  {showCTAButtonList ? "Hide" : "Select"} Existing CTA Buttons
                </Button>
              </div>

              {/* Existing CTA Buttons List */}
              {showCTAButtonList && allCTAButtons.length > 0 && (
                <div className="border rounded-lg p-4 max-h-64 overflow-y-auto space-y-2">
                  {allCTAButtons.map((ctaButton) => {
                    const isSelected = sectionCTAButtons.some((c) => c.id === ctaButton.id);
                    return (
                      <div
                        key={ctaButton.id}
                        className="flex items-center gap-3 p-2 hover:bg-muted rounded cursor-pointer"
                        onClick={() => !isSelected && handleAddExistingCTA(ctaButton.id)}
                      >
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => {
                            if (isSelected) {
                              handleRemoveCTA(ctaButton.id);
                            } else {
                              handleAddExistingCTA(ctaButton.id);
                            }
                          }}
                        />
                        <div className="h-8 w-8 rounded-full flex items-center justify-center bg-muted flex-shrink-0">
                          <FontAwesomeIcon
                            icon={ctaButton.icon ? (ctaButton.icon as any) : faMousePointer}
                            className="h-4 w-4 text-muted-foreground"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-medium">{ctaButton.label}</span>
                          <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <FontAwesomeIcon icon={faLink} className="h-3 w-3" />
                            <span className="truncate">{ctaButton.url}</span>
                          </div>
                        </div>
                        <Badge
                          variant={ctaButton.status === "active" ? "default" : "outline"}
                          className="text-xs"
                        >
                          {ctaButton.status === "active" ? "Active" : "Deactivated"}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Content (JSON)</FormLabel>
                <FormControl>
                  <div className="border border-input rounded-lg bg-input-background overflow-hidden">
                    <CodeEditor
                      value={field.value || ""}
                      language="json"
                      placeholder='Enter JSON content, e.g., {"key": "value"}'
                      onChange={(value) => field.onChange(value)}
                      padding={12}
                      className="font-mono text-sm"
                      style={{ minHeight: "160px", borderRadius: 0 }}
                      data-color-mode="light"
                    />
                  </div>
                </FormControl>
                <FormDescription>
                  Optional JSON content for the section. Must be valid JSON format.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Media URL field hidden - using media relationship instead */}
          {/* <FormField
            control={form.control}
            name="media_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Media URL {sectionType !== "hero" && <span className="text-muted-foreground text-sm font-normal">(Hero sections only)</span>}</FormLabel>
                <FormControl>
                  <div className={sectionType !== "hero" ? "opacity-50 pointer-events-none" : ""}>
                    <VideoUploadField
                      value={sectionType === "hero" ? (field.value || null) : null}
                      onChange={(url) => {
                        if (sectionType === "hero") {
                          field.onChange(url || "");
                        }
                      }}
                      onFileChange={(file) => {
                        if (sectionType === "hero") {
                          setSelectedFile(file);
                        }
                      }}
                      folderPath={isEdit && initialData ? `sections/${initialData.id}` : "sections/temp"}
                      error={form.formState.errors.media_url?.message}
                      placeholder="https://example.com/video.mp4"
                    />
                  </div>
                </FormControl>
                <FormDescription>
                  {sectionType === "hero" 
                    ? "Upload or enter a URL for video media (Hero sections only)"
                    : "Media URL is only available for Hero sections"}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          /> */}
        </div>
        <div className="flex items-center justify-end gap-4 mt-6">
          <Button
            type="button"
            variant="outline"
            className="bg-card hover:bg-card/80"
            asChild
            disabled={isSubmitting}
          >
            <Link href="/admin/sections">Cancel</Link>
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : isEdit ? "Update Section" : "Create Section"}
          </Button>
        </div>
      </form>

      {/* Add New Media Dialog - Outside form to prevent form submission */}
      <Dialog open={isAddMediaDialogOpen} onOpenChange={setIsAddMediaDialogOpen}>
        <DialogContent 
          className="max-w-xl overflow-hidden flex flex-col p-0" 
          style={{ width: '90%', maxWidth: '42rem', maxHeight: '90vh' }}
        >
          <DialogHeader className="flex-shrink-0 px-6 mt-6 pt-6 pb-4">
            <DialogTitle>Add New Media</DialogTitle>
            <DialogDescription>
              Create a new media item. After creating, you can add it to this section.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto min-h-0 px-6 pb-6">
            <MediaForm
              onSuccess={handleNewMediaCreated}
              onCancel={() => setIsAddMediaDialogOpen(false)}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Media Preview Dialog */}
      <Dialog open={!!previewMedia} onOpenChange={(open) => !open && setPreviewMedia(null)}>
        <DialogContent 
          className="max-w-4xl overflow-hidden flex flex-col p-0" 
          style={{ width: '90%', maxWidth: '56rem', maxHeight: '90vh' }}
        >
          <DialogHeader className="flex-shrink-0 px-6 mt-6 pt-6 pb-4">
            <DialogTitle>{previewMedia?.name || "Media Preview"}</DialogTitle>
            <DialogDescription>
              {previewMedia && (
                <span className="capitalize">
                  {previewMedia.type} • {previewMedia.source_type.replace("_", " ")}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto min-h-0 px-6 pb-6">
            {previewMedia && (
              <div className="w-full aspect-video bg-muted rounded-lg overflow-hidden">
                <MediaRenderer
                  media={previewMedia}
                  className="w-full h-full"
                  autoPlay={false}
                  muted={true}
                  loop={false}
                  controls={true}
                />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Add New CTA Button Dialog - Outside form to prevent form submission */}
      <Dialog open={isAddCTADialogOpen} onOpenChange={setIsAddCTADialogOpen}>
        <DialogContent 
          className="max-w-xl overflow-hidden flex flex-col p-0" 
          style={{ width: '90%', maxWidth: '42rem', maxHeight: '90vh' }}
        >
          <DialogHeader className="flex-shrink-0 px-6 mt-6 pt-6 pb-4">
            <DialogTitle>Add New CTA Button</DialogTitle>
            <DialogDescription>
              Create a new CTA button. After creating, you can add it to this section.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto min-h-0 px-6 pb-6">
            <CTAButtonForm
              onSuccess={handleNewCTACreated}
              onCancel={() => setIsAddCTADialogOpen(false)}
            />
          </div>
        </DialogContent>
      </Dialog>
    </Form>
  );
}

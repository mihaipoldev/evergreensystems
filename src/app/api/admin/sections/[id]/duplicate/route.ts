import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import type { Database } from "@/lib/supabase/types";

type Section = Database["public"]["Tables"]["sections"]["Row"];
type SectionMedia = Database["public"]["Tables"]["section_media"]["Row"];
type SectionCTAButton = Database["public"]["Tables"]["section_cta_buttons"]["Row"];
type SectionFeature = {
  id: string;
  section_id: string;
  feature_id: string;
  position: number;
  status: "published" | "draft" | "deactivated";
  created_at: string;
  updated_at: string;
};
type SectionTimeline = {
  id: string;
  section_id: string;
  timeline_id: string;
  position: number;
  status: "published" | "draft" | "deactivated";
  created_at: string;
  updated_at: string;
};
type SectionTestimonial = {
  id: string;
  section_id: string;
  testimonial_id: string;
  position: number;
  status: "published" | "draft" | "deactivated";
  created_at: string;
  updated_at: string;
};
type SectionFAQ = {
  id: string;
  section_id: string;
  faq_item_id: string;
  position: number;
  status: "published" | "draft" | "deactivated";
  created_at: string;
  updated_at: string;
};
type SectionSocial = {
  id: string;
  section_id: string;
  platform_id: string;
  order: number;
  status: "published" | "draft" | "deactivated";
  created_at: string;
  updated_at: string;
};
type SectionSoftware = {
  id: string;
  section_id: string;
  software_id: string;
  order: number;
  icon_override: string | null;
  status: "published" | "draft" | "deactivated";
  created_at: string;
  updated_at: string;
};

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Use service role client to bypass RLS for admin operations
    const adminSupabase = createServiceRoleClient();

    // Fetch original section
    const { data: original, error: fetchError } = await adminSupabase
      .from("sections")
      .select("*")
      .eq("id", id)
      .single<Section>();

    if (fetchError || !original) {
      return NextResponse.json(
        { error: "Section not found" },
        { status: 404 }
      );
    }

    // Generate duplicate admin_title with version number (V2, V3, etc.)
    // Keep title as-is (it's shown on website), only change admin_title
    let duplicateAdminTitle: string | null = null;
    
    if (original.admin_title) {
      // Extract base name (remove existing version if present)
      const baseName = original.admin_title.replace(/\s+V\d+$/, '');
      
      // Find the next version number
      let version = 2;
      while (true) {
        const versionedName = `${baseName} V${version}`;
        const { data: existing } = await adminSupabase
          .from("sections")
          .select("id")
          .eq("admin_title", versionedName)
          .maybeSingle();
        
        if (!existing) {
          duplicateAdminTitle = versionedName;
          break;
        }
        version++;
      }
    }

    // Create duplicate section
    // Keep title as-is (exact copy) since it's shown on website
    const { data: duplicateSection, error: duplicateError } = await (adminSupabase
      .from("sections") as any)
      .insert({
        type: original.type,
        title: original.title, // Keep title as-is
        admin_title: duplicateAdminTitle,
        subtitle: original.subtitle,
        eyebrow: original.eyebrow,
        content: original.content,
        media_url: original.media_url,
      })
      .select()
      .single();

    if (duplicateError) {
      return NextResponse.json(
        { error: duplicateError.message },
        { status: 500 }
      );
    }

    const newSectionId = duplicateSection.id;

    // Fetch all junction table entries for the original section
    // 1. Media connections
    const { data: sectionMedia } = await adminSupabase
      .from("section_media")
      .select("*")
      .eq("section_id", id)
      .order("sort_order", { ascending: true })
      .returns<SectionMedia[]>();

    // 2. CTA button connections
    const { data: sectionCTAs } = await adminSupabase
      .from("section_cta_buttons")
      .select("*")
      .eq("section_id", id)
      .order("position", { ascending: true })
      .returns<SectionCTAButton[]>();

    // 3. Feature connections
    const { data: sectionFeatures } = await adminSupabase
      .from("section_features")
      .select("*")
      .eq("section_id", id)
      .order("position", { ascending: true })
      .returns<SectionFeature[]>();

    // 4. Timeline connections
    const { data: sectionTimelines } = await adminSupabase
      .from("section_timeline")
      .select("*")
      .eq("section_id", id)
      .order("position", { ascending: true })
      .returns<SectionTimeline[]>();

    // 5. Testimonial connections
    const { data: sectionTestimonials } = await adminSupabase
      .from("section_testimonials")
      .select("*")
      .eq("section_id", id)
      .order("position", { ascending: true })
      .returns<SectionTestimonial[]>();

    // 6. FAQ connections
    const { data: sectionFAQs } = await adminSupabase
      .from("section_faq_items")
      .select("*")
      .eq("section_id", id)
      .order("position", { ascending: true })
      .returns<SectionFAQ[]>();

    // 7. Social platform connections
    const { data: sectionSocials } = await adminSupabase
      .from("section_socials")
      .select("*")
      .eq("section_id", id)
      .order("order", { ascending: true })
      .returns<SectionSocial[]>();

    // 8. Software connections
    const { data: sectionSoftwares } = await adminSupabase
      .from("section_softwares")
      .select("*")
      .eq("section_id", id)
      .order("order", { ascending: true })
      .returns<SectionSoftware[]>();

    // Create duplicate junction entries pointing to the same related entities
    const errors: string[] = [];

    // Duplicate media connections
    if (sectionMedia && sectionMedia.length > 0) {
      const mediaInserts = sectionMedia.map((item) => ({
        section_id: newSectionId,
        media_id: item.media_id,
        role: item.role,
        sort_order: item.sort_order,
      }));
      const { error: mediaError } = await (adminSupabase
        .from("section_media") as any)
        .insert(mediaInserts);
      if (mediaError) {
        errors.push(`Media: ${mediaError.message}`);
      }
    }

    // Duplicate CTA button connections
    if (sectionCTAs && sectionCTAs.length > 0) {
      const ctaInserts = sectionCTAs.map((item) => ({
        section_id: newSectionId,
        cta_button_id: item.cta_button_id,
        position: item.position,
        status: (item as any).status || "draft", // Include status from junction table
      }));
      const { error: ctaError } = await (adminSupabase
        .from("section_cta_buttons") as any)
        .insert(ctaInserts);
      if (ctaError) {
        errors.push(`CTAs: ${ctaError.message}`);
      }
    }

    // Duplicate feature connections
    if (sectionFeatures && sectionFeatures.length > 0) {
      const featureInserts = sectionFeatures.map((item) => ({
        section_id: newSectionId,
        feature_id: item.feature_id,
        position: item.position,
        status: item.status || "draft", // Include status from junction table
      }));
      const { error: featureError } = await (adminSupabase
        .from("section_features") as any)
        .insert(featureInserts);
      if (featureError) {
        errors.push(`Features: ${featureError.message}`);
      }
    }

    // Duplicate timeline connections
    if (sectionTimelines && sectionTimelines.length > 0) {
      const timelineInserts = sectionTimelines.map((item) => ({
        section_id: newSectionId,
        timeline_id: item.timeline_id,
        position: item.position,
        status: item.status || "draft", // Include status from junction table
      }));
      const { error: timelineError } = await (adminSupabase
        .from("section_timeline") as any)
        .insert(timelineInserts);
      if (timelineError) {
        errors.push(`Timelines: ${timelineError.message}`);
      }
    }

    // Duplicate testimonial connections
    if (sectionTestimonials && sectionTestimonials.length > 0) {
      const testimonialInserts = sectionTestimonials.map((item) => ({
        section_id: newSectionId,
        testimonial_id: item.testimonial_id,
        position: item.position,
        status: item.status || "draft", // Include status from junction table
      }));
      const { error: testimonialError } = await (adminSupabase
        .from("section_testimonials") as any)
        .insert(testimonialInserts);
      if (testimonialError) {
        errors.push(`Testimonials: ${testimonialError.message}`);
      }
    }

    // Duplicate FAQ connections
    if (sectionFAQs && sectionFAQs.length > 0) {
      const faqInserts = sectionFAQs.map((item) => ({
        section_id: newSectionId,
        faq_item_id: item.faq_item_id,
        position: item.position,
        status: item.status || "draft", // Include status from junction table
      }));
      const { error: faqError } = await (adminSupabase
        .from("section_faq_items") as any)
        .insert(faqInserts);
      if (faqError) {
        errors.push(`FAQs: ${faqError.message}`);
      }
    }

    // Duplicate social platform connections
    if (sectionSocials && sectionSocials.length > 0) {
      const socialInserts = sectionSocials.map((item) => ({
        section_id: newSectionId,
        platform_id: item.platform_id,
        order: item.order,
        status: item.status || "draft", // Include status from junction table
      }));
      const { error: socialError } = await (adminSupabase
        .from("section_socials") as any)
        .insert(socialInserts);
      if (socialError) {
        errors.push(`Social platforms: ${socialError.message}`);
      }
    }

    // Duplicate software connections
    if (sectionSoftwares && sectionSoftwares.length > 0) {
      const softwareInserts = sectionSoftwares.map((item) => ({
        section_id: newSectionId,
        software_id: item.software_id,
        order: item.order,
        icon_override: item.icon_override,
        status: item.status || "draft", // Include status from junction table
      }));
      const { error: softwareError } = await (adminSupabase
        .from("section_softwares") as any)
        .insert(softwareInserts);
      if (softwareError) {
        errors.push(`Softwares: ${softwareError.message}`);
      }
    }

    // Log errors but don't fail the request
    if (errors.length > 0) {
      console.error("Errors duplicating section connections:", errors);
    }

    // Invalidate cache
    revalidateTag("sections", "max");

    return NextResponse.json(
      {
        ...duplicateSection,
        warnings: errors.length > 0 ? errors : undefined,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}

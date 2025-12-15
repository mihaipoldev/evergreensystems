import { notFound } from "next/navigation";
import { AdminPageTitle } from "@/components/admin/AdminPageTitle";
import { ApprovedSwitchForm } from "@/components/admin/ApprovedSwitchForm";
import { FAQForm } from "@/features/faq/components/FAQForm";
import { TestimonialForm } from "@/features/testimonials/components/TestimonialForm";
import { FeatureForm } from "@/features/features/components/FeatureForm";
import { CTAButtonForm } from "@/features/cta/components/CTAButtonForm";
import { getFAQItemById } from "@/features/faq/data";
import { getTestimonialById } from "@/features/testimonials/data";
import { getOfferFeatureById } from "@/features/features/data";
import { getCTAButtonById } from "@/features/cta/data";
import { getSectionById } from "@/features/sections/data";

type EditItemPageProps = {
  params: Promise<{ id: string; sectionId: string; itemId: string }>;
};

export default async function EditItemPage({ params }: EditItemPageProps) {
  const { id: pageId, sectionId, itemId } = await params;
  
  // Get section to determine item type
  const section = await getSectionById(sectionId);
  if (!section) {
    notFound();
  }

  const returnTo = `/admin/pages/${pageId}/sections/${sectionId}?tab=items`;

  // Render appropriate form based on section type
  if (section.type === "faq") {
    const faqItem = await getFAQItemById(itemId);
    if (!faqItem) {
      notFound();
    }
    return (
      <div className="w-full space-y-6">
        <div className="mb-6 md:mb-8">
          <AdminPageTitle
            title="Edit FAQ Item"
            entityName={faqItem.question}
            description="Update the FAQ item details"
          />
        </div>
        <FAQForm initialData={faqItem} isEdit={true} returnTo={returnTo} />
      </div>
    );
  } else if (section.type === "testimonials") {
    const testimonial = await getTestimonialById(itemId);
    if (!testimonial) {
      notFound();
    }
    return (
      <div className="w-full space-y-6">
        <TestimonialForm
          initialData={testimonial}
          isEdit={true}
          returnTo={returnTo}
          rightSideHeaderContent={
            <div className="mb-6 md:mb-8">
              <AdminPageTitle
                title="Edit Testimonial"
                entityName={testimonial.author_name}
                description="Update the testimonial details"
                rightSideContent={<ApprovedSwitchForm />}
              />
            </div>
          }
        />
      </div>
    );
  } else if (section.type === "features") {
    const feature = await getOfferFeatureById(itemId);
    if (!feature) {
      notFound();
    }
    return (
      <div className="w-full space-y-6">
        <div className="mb-6 md:mb-8">
          <AdminPageTitle
            title="Edit Feature"
            entityName={feature.title}
            description="Update the feature details"
          />
        </div>
        <FeatureForm initialData={feature} isEdit={true} returnTo={returnTo} />
      </div>
    );
  } else if (section.type === "cta") {
    const ctaButton = await getCTAButtonById(itemId);
    if (!ctaButton) {
      notFound();
    }
    return (
      <div className="w-full space-y-6">
        <div className="mb-6 md:mb-8">
          <AdminPageTitle
            title="Edit CTA Button"
            entityName={ctaButton.label}
            description="Update the CTA button details"
          />
        </div>
        <CTAButtonForm initialData={ctaButton} isEdit={true} returnTo={returnTo} />
      </div>
    );
  } else {
    notFound();
  }
}

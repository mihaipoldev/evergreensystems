"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, startTransition } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { cn } from "@/lib/utils";
import { SectionForm } from "@/features/page-builder/sections/components/SectionForm";
import { FAQList } from "@/features/page-builder/faq/components/FAQList";
import { TestimonialsList } from "@/features/page-builder/testimonials/components/TestimonialsList";
import { FeaturesList } from "@/features/page-builder/features/components/FeaturesList";
import { TimelineList } from "@/features/page-builder/timeline/components/TimelineList";
import { ResultsList } from "@/features/page-builder/results/components/ResultsList";
import { SectionMediaTab } from "@/components/admin/SectionMediaTab";
import { SectionCTATab } from "@/components/admin/SectionCTATab";
import { SectionFeaturesTab } from "@/components/admin/SectionFeaturesTab";
import { SectionTestimonialsTab } from "@/components/admin/SectionTestimonialsTab";
import { SectionFAQTab } from "@/components/admin/SectionFAQTab";
import { SectionTimelineTab } from "@/components/admin/SectionTimelineTab";
import { SectionResultsTab } from "@/components/admin/SectionResultsTab";
import { SectionSoftwaresTab } from "@/components/admin/SectionSoftwaresTab";
import { SectionSocialPlatformsTab } from "@/components/admin/SectionSocialPlatformsTab";
import { getStoredSectionTab, setStoredSectionTab, type SectionTab } from "@/lib/tab-persistence";
import type { Section } from "@/features/page-builder/sections/types";
import type { FAQItem, FAQItemWithSection } from "@/features/page-builder/faq/types";
import type { Testimonial, TestimonialWithSection } from "@/features/page-builder/testimonials/types";
import type { OfferFeature, OfferFeatureWithSection } from "@/features/page-builder/features/types";
import type { MediaWithSection } from "@/features/page-builder/media/types";
import type { CTAButtonWithSection } from "@/features/page-builder/cta/types";
import type { Timeline, TimelineWithSection } from "@/features/page-builder/timeline/types";
import type { Result, ResultWithSection } from "@/features/page-builder/results/types";
import type { SoftwareWithSection } from "@/features/page-builder/softwares/types";
import type { SocialPlatformWithSection } from "@/features/page-builder/social-platforms/types";

type SectionContentTabsProps = {
  section: Section;
  pageId?: string;
  initialFAQItems?: FAQItemWithSection[];
  initialTestimonials?: TestimonialWithSection[];
  initialFeatures?: OfferFeatureWithSection[];
  initialCTAButtons?: CTAButtonWithSection[];
  initialMedia?: MediaWithSection[];
  initialHeroCTAButtons?: CTAButtonWithSection[];
  initialTimelineItems?: TimelineWithSection[];
  initialResults?: ResultWithSection[];
  initialSoftwares?: SoftwareWithSection[];
  initialSocialPlatforms?: SocialPlatformWithSection[];
};

const CONTENT_SECTION_TYPES = ["faq", "testimonials", "features", "offer", "cta", "timeline", "results"] as const;

export function SectionContentTabs({
  section,
  pageId,
  initialFAQItems = [],
  initialTestimonials = [],
  initialFeatures = [],
  initialCTAButtons = [],
  initialMedia = [],
  initialHeroCTAButtons = [],
  initialTimelineItems = [],
  initialResults = [],
  initialSoftwares = [],
  initialSocialPlatforms = [],
}: SectionContentTabsProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasContentItems = CONTENT_SECTION_TYPES.includes(section.type as any);
  const isHeroSection = section.type === "hero";
  const isHeaderSection = section.type === "header";
  const isStoriesSection = section.type === "stories";
  const isLogosSection = section.type === "logos";
  const isFooterSection = section.type === "footer";
  const hasMediaAndCTATabs = isHeroSection; // Hero sections have Media + CTA tabs
  const hasCTATabOnly = isHeaderSection; // Header sections have only CTA tab
  const hasMediaTabOnly = isStoriesSection; // Stories sections have only Media tab
  const hasSoftwaresTab = isLogosSection; // Logos sections have Softwares tab
  const hasSocialPlatformsTab = isFooterSection; // Footer sections have Social Platforms tab
  
  // Get default tab based on section type
  const getDefaultTab = (): SectionTab => {
    if (hasMediaAndCTATabs) {
      return "media";
    } else if (hasCTATabOnly) {
      return "cta";
    } else if (hasMediaTabOnly) {
      return "media";
    } else if (hasSoftwaresTab) {
      return "softwares";
    } else if (hasSocialPlatformsTab) {
      return "social-platforms";
    } else if (hasContentItems) {
      // Return section-type-specific tab
      switch (section.type) {
        case "faq":
          return "faq";
        case "testimonials":
          return "testimonials";
        case "features":
          return "features";
        case "offer":
          return "features";
        case "timeline":
          return "timeline";
        case "results":
          return "results";
        case "cta":
          return "cta";
        default:
          return "edit";
      }
    }
    return "edit";
  };

  // Determine active tab: URL param > localStorage > default
  const tabParam = searchParams.get("tab") as SectionTab | null;
  const storedTab = getStoredSectionTab(section.id);
  const defaultTab = getDefaultTab();
  const activeTab: SectionTab = tabParam || storedTab || defaultTab;

  // Get content tab name and label based on section type
  const getContentTabInfo = () => {
    switch (section.type) {
      case "faq":
        return { tab: "faq" as SectionTab, label: "FAQ" };
      case "testimonials":
        return { tab: "testimonials" as SectionTab, label: "Testimonials" };
      case "features":
        return { tab: "features" as SectionTab, label: "Features" };
      case "offer":
        return { tab: "features" as SectionTab, label: "Features" };
      case "cta":
        return { tab: "cta" as SectionTab, label: "CTA" };
      case "timeline":
        return { tab: "timeline" as SectionTab, label: "Timeline" };
      case "results":
        return { tab: "results" as SectionTab, label: "Results" };
      default:
        return { tab: "edit" as SectionTab, label: "Details" };
    }
  };

  const contentTabInfo = hasContentItems ? getContentTabInfo() : null;

  const renderContentList = () => {
    switch (section.type) {
      case "faq":
        return <SectionFAQTab sectionId={section.id} pageId={pageId} initialFAQItems={initialFAQItems} />;
      case "testimonials":
        return <SectionTestimonialsTab sectionId={section.id} pageId={pageId} initialTestimonials={initialTestimonials} />;
      case "features":
        return <SectionFeaturesTab sectionId={section.id} pageId={pageId} initialFeatures={initialFeatures} />;
      case "offer":
        return <SectionFeaturesTab sectionId={section.id} pageId={pageId} initialFeatures={initialFeatures} />;
      case "cta":
        return <SectionCTATab sectionId={section.id} pageId={pageId} initialCTAButtons={initialCTAButtons} />;
      case "timeline":
        return <SectionTimelineTab sectionId={section.id} pageId={pageId} initialTimelineItems={initialTimelineItems} />;
      case "results":
        return <SectionResultsTab sectionId={section.id} pageId={pageId} initialResults={initialResults} />;
      default:
        return null;
    }
  };

  // Build base href with new URL structure: /admin/sections/[id]?pageId=[pageId]
  const baseHref = pageId 
    ? `/admin/sections/${section.id}?pageId=${pageId}`
    : `/admin/sections/${section.id}`;
  const editHref = pageId 
    ? `/admin/sections/${section.id}?pageId=${pageId}&tab=edit`
    : `/admin/sections/${section.id}?tab=edit`;
  const mediaHref = pageId 
    ? `/admin/sections/${section.id}?pageId=${pageId}&tab=media`
    : `/admin/sections/${section.id}?tab=media`;
  const ctaHref = pageId 
    ? `/admin/sections/${section.id}?pageId=${pageId}&tab=cta`
    : `/admin/sections/${section.id}?tab=cta`;
  const softwaresHref = pageId 
    ? `/admin/sections/${section.id}?pageId=${pageId}&tab=softwares`
    : `/admin/sections/${section.id}?tab=softwares`;
  const socialPlatformsHref = pageId 
    ? `/admin/sections/${section.id}?pageId=${pageId}&tab=social-platforms`
    : `/admin/sections/${section.id}?tab=social-platforms`;
  const contentTabHref = contentTabInfo 
    ? (pageId 
        ? `/admin/sections/${section.id}?pageId=${pageId}&tab=${contentTabInfo.tab}`
        : `/admin/sections/${section.id}?tab=${contentTabInfo.tab}`)
    : null;

  // Local state for optimistic tab UI and loading
  const [pendingTab, setPendingTab] = useState<SectionTab | null>(null);
  const [showLoader, setShowLoader] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(!!tabParam); // Initialize based on whether URL already has param

  // Save tab to localStorage when URL param changes, and ensure URL has query param
  useEffect(() => {
    if (!hasInitialized) {
      // On initial load, ensure URL has query param
      if (!tabParam) {
        const newHref = pageId 
        ? `/admin/sections/${section.id}?pageId=${pageId}&tab=${activeTab}`
        : `/admin/sections/${section.id}?tab=${activeTab}`;
      router.replace(newHref, { scroll: false });
        // Don't set hasInitialized yet - wait for URL to update
        return;
      }
      // URL has query param, initialization complete
      setHasInitialized(true);
      return;
    }

    if (tabParam) {
      // URL has tab param - save to localStorage if different
      if (tabParam !== storedTab) {
        setStoredSectionTab(section.id, tabParam);
      }
    }
  }, [tabParam, activeTab, storedTab, section.id, baseHref, router, hasInitialized]);

  // Determine active tab states
  const isEditTab = activeTab === "edit";
  const isMediaTab = activeTab === "media";
  const isCTATab = activeTab === "cta";
  const isSoftwaresTab = activeTab === "softwares";
  const isSocialPlatformsTab = activeTab === "social-platforms";
  const isContentTab = contentTabInfo ? activeTab === contentTabInfo.tab : false;

  // Use pendingTab for optimistic UI
  const effectiveIsEditTab = pendingTab ? pendingTab === "edit" : isEditTab;
  const effectiveIsMediaTab = pendingTab ? pendingTab === "media" : isMediaTab;
  const effectiveIsCTATab = pendingTab ? pendingTab === "cta" : isCTATab;
  const effectiveIsSoftwaresTab = pendingTab ? pendingTab === "softwares" : isSoftwaresTab;
  const effectiveIsSocialPlatformsTab = pendingTab ? pendingTab === "social-platforms" : isSocialPlatformsTab;
  const effectiveIsContentTab = contentTabInfo ? (pendingTab ? pendingTab === contentTabInfo.tab : isContentTab) : false;

  // Track if we're loading content for tabs (only when user clicks, not on initial load)
  const isTabNavigating = hasInitialized && pendingTab !== null && activeTab !== pendingTab;

  // Show loader after a small delay to avoid flash for fast navigations
  // Never show loader during initialization
  useEffect(() => {
    if (!hasInitialized) {
      setShowLoader(false);
      return;
    }

    let timeout: NodeJS.Timeout;
    if (isTabNavigating) {
      timeout = setTimeout(() => {
        setShowLoader(true);
      }, 50);
    } else {
      setShowLoader(false);
    }
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [isTabNavigating, hasInitialized]);

  // Clear pending tab when active tab matches
  useEffect(() => {
    if (pendingTab && activeTab === pendingTab) {
      setPendingTab(null);
    }
  }, [activeTab, pendingTab]);

  const handleTabClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string, tab: SectionTab) => {
    e.preventDefault();
    
    // Update UI optimistically for instant feedback
    setPendingTab(tab);
    
    // Save tab preference to localStorage
    setStoredSectionTab(section.id, tab);
    
    // Use startTransition for non-urgent navigation update
    startTransition(() => {
      router.push(href, { scroll: false });
    });
  };
  
  // For hero sections, media tab is default (no redirect needed, handled by isMediaTab logic)
  // For header sections, CTA tab is default (no redirect needed, handled by isCTATab logic)

  // For hero sections: show Details, Media, and CTA tabs
  if (hasMediaAndCTATabs) {
    return (
      <div className="w-full relative">
        {/* Tab navigation for sections with Media/CTA tabs */}
        <nav className="border-b border-border mb-3">
          <div className="flex gap-6">
            <Link
              href={editHref}
              onClick={(e) => handleTabClick(e, editHref, "edit")}
              prefetch={true}
              className={cn(
                "pb-3 text-sm font-medium transition-colors",
                effectiveIsEditTab
                  ? "text-foreground border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Details
            </Link>
            <Link
              href={mediaHref}
              onClick={(e) => handleTabClick(e, mediaHref, "media")}
              prefetch={true}
              className={cn(
                "pb-3 text-sm font-medium transition-colors",
                effectiveIsMediaTab
                  ? "text-foreground border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Media
            </Link>
            <Link
              href={ctaHref}
              onClick={(e) => handleTabClick(e, ctaHref, "cta")}
              prefetch={true}
              className={cn(
                "pb-3 text-sm font-medium transition-colors",
                effectiveIsCTATab
                  ? "text-foreground border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              CTA
            </Link>
          </div>
        </nav>

        {/* Content based on active tab */}
        {isEditTab ? (
          <div className="relative">
            {showLoader && (
              <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="flex flex-col items-center gap-3">
                  <FontAwesomeIcon 
                    icon={faSpinner} 
                    className="h-8 w-8 text-primary animate-spin" 
                  />
                  <p className="text-sm text-muted-foreground">Loading...</p>
                </div>
              </div>
            )}
            <SectionForm initialData={section} isEdit={true} pageId={pageId || undefined} />
          </div>
        ) : isMediaTab ? (
          <div className="relative">
            {showLoader && (
              <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="flex flex-col items-center gap-3">
                  <FontAwesomeIcon 
                    icon={faSpinner} 
                    className="h-8 w-8 text-primary animate-spin" 
                  />
                  <p className="text-sm text-muted-foreground">Loading...</p>
                </div>
              </div>
            )}
            <SectionMediaTab sectionId={section.id} initialMedia={initialMedia} sectionType={section.type} />
          </div>
        ) : (
          <div className="relative">
            {showLoader && (
              <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="flex flex-col items-center gap-3">
                  <FontAwesomeIcon 
                    icon={faSpinner} 
                    className="h-8 w-8 text-primary animate-spin" 
                  />
                  <p className="text-sm text-muted-foreground">Loading...</p>
                </div>
              </div>
            )}
            <SectionCTATab sectionId={section.id} pageId={pageId || undefined} initialCTAButtons={initialHeroCTAButtons} />
          </div>
        )}
      </div>
    );
  }

  // For header sections: show Details and CTA tabs only (no Media tab)
  if (hasCTATabOnly) {
    return (
      <div className="w-full relative">
        {/* Tab navigation for header sections */}
        <nav className="border-b border-border mb-3">
          <div className="flex gap-6">
            <Link
              href={editHref}
              onClick={(e) => handleTabClick(e, editHref, "edit")}
              prefetch={true}
              className={cn(
                "pb-3 text-sm font-medium transition-colors",
                effectiveIsEditTab
                  ? "text-foreground border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Details
            </Link>
            <Link
              href={ctaHref}
              onClick={(e) => handleTabClick(e, ctaHref, "cta")}
              prefetch={true}
              className={cn(
                "pb-3 text-sm font-medium transition-colors",
                effectiveIsCTATab
                  ? "text-foreground border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              CTA
            </Link>
          </div>
        </nav>

        {/* Content based on active tab */}
        {isEditTab ? (
          <div className="relative">
            {showLoader && (
              <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="flex flex-col items-center gap-3">
                  <FontAwesomeIcon 
                    icon={faSpinner} 
                    className="h-8 w-8 text-primary animate-spin" 
                  />
                  <p className="text-sm text-muted-foreground">Loading...</p>
                </div>
              </div>
            )}
            <SectionForm initialData={section} isEdit={true} pageId={pageId || undefined} />
          </div>
        ) : (
          <div className="relative">
            {showLoader && (
              <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="flex flex-col items-center gap-3">
                  <FontAwesomeIcon 
                    icon={faSpinner} 
                    className="h-8 w-8 text-primary animate-spin" 
                  />
                  <p className="text-sm text-muted-foreground">Loading...</p>
                </div>
              </div>
            )}
            <SectionCTATab sectionId={section.id} pageId={pageId || undefined} initialCTAButtons={initialHeroCTAButtons} />
          </div>
        )}
      </div>
    );
  }

  // For stories sections: show Details and Media tabs only (no CTA tab)
  if (hasMediaTabOnly) {
    return (
      <div className="w-full relative">
        {/* Tab navigation for stories sections */}
        <nav className="border-b border-border mb-3">
          <div className="flex gap-6">
            <Link
              href={editHref}
              onClick={(e) => handleTabClick(e, editHref, "edit")}
              prefetch={true}
              className={cn(
                "pb-3 text-sm font-medium transition-colors",
                effectiveIsEditTab
                  ? "text-foreground border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Details
            </Link>
            <Link
              href={mediaHref}
              onClick={(e) => handleTabClick(e, mediaHref, "media")}
              prefetch={true}
              className={cn(
                "pb-3 text-sm font-medium transition-colors",
                effectiveIsMediaTab
                  ? "text-foreground border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Media
            </Link>
          </div>
        </nav>

        {/* Content based on active tab */}
        {isEditTab ? (
          <div className="relative">
            {showLoader && (
              <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="flex flex-col items-center gap-3">
                  <FontAwesomeIcon 
                    icon={faSpinner} 
                    className="h-8 w-8 text-primary animate-spin" 
                  />
                  <p className="text-sm text-muted-foreground">Loading...</p>
                </div>
              </div>
            )}
            <SectionForm initialData={section} isEdit={true} pageId={pageId || undefined} />
          </div>
        ) : (
          <div className="relative">
            {showLoader && (
              <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="flex flex-col items-center gap-3">
                  <FontAwesomeIcon 
                    icon={faSpinner} 
                    className="h-8 w-8 text-primary animate-spin" 
                  />
                  <p className="text-sm text-muted-foreground">Loading...</p>
                </div>
              </div>
            )}
            <SectionMediaTab sectionId={section.id} initialMedia={initialMedia} sectionType={section.type} />
          </div>
        )}
      </div>
    );
  }

  // For logos sections: show Details and Softwares tabs
  if (hasSoftwaresTab) {
    return (
      <div className="w-full relative">
        {/* Tab navigation for logos sections */}
        <nav className="border-b border-border mb-3">
          <div className="flex gap-6">
            <Link
              href={editHref}
              onClick={(e) => handleTabClick(e, editHref, "edit")}
              prefetch={true}
              className={cn(
                "pb-3 text-sm font-medium transition-colors",
                effectiveIsEditTab
                  ? "text-foreground border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Details
            </Link>
            <Link
              href={softwaresHref}
              onClick={(e) => handleTabClick(e, softwaresHref, "softwares")}
              prefetch={true}
              className={cn(
                "pb-3 text-sm font-medium transition-colors",
                effectiveIsSoftwaresTab
                  ? "text-foreground border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Softwares
            </Link>
          </div>
        </nav>

        {/* Content based on active tab */}
        {isEditTab ? (
          <div className="relative">
            {showLoader && (
              <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="flex flex-col items-center gap-3">
                  <FontAwesomeIcon 
                    icon={faSpinner} 
                    className="h-8 w-8 text-primary animate-spin" 
                  />
                  <p className="text-sm text-muted-foreground">Loading...</p>
                </div>
              </div>
            )}
            <SectionForm initialData={section} isEdit={true} pageId={pageId || undefined} />
          </div>
        ) : (
          <div className="relative">
            {showLoader && (
              <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="flex flex-col items-center gap-3">
                  <FontAwesomeIcon 
                    icon={faSpinner} 
                    className="h-8 w-8 text-primary animate-spin" 
                  />
                  <p className="text-sm text-muted-foreground">Loading...</p>
                </div>
              </div>
            )}
            <SectionSoftwaresTab sectionId={section.id} pageId={pageId} initialSoftwares={initialSoftwares} />
          </div>
        )}
      </div>
    );
  }

  // For footer sections: show Details and Social Platforms tabs
  if (hasSocialPlatformsTab) {
    return (
      <div className="w-full relative">
        {/* Tab navigation for footer sections */}
        <nav className="border-b border-border mb-3">
          <div className="flex gap-6">
            <Link
              href={editHref}
              onClick={(e) => handleTabClick(e, editHref, "edit")}
              prefetch={true}
              className={cn(
                "pb-3 text-sm font-medium transition-colors",
                effectiveIsEditTab
                  ? "text-foreground border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Details
            </Link>
            <Link
              href={socialPlatformsHref}
              onClick={(e) => handleTabClick(e, socialPlatformsHref, "social-platforms")}
              prefetch={true}
              className={cn(
                "pb-3 text-sm font-medium transition-colors",
                effectiveIsSocialPlatformsTab
                  ? "text-foreground border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Social Platforms
            </Link>
          </div>
        </nav>

        {/* Content based on active tab */}
        {isEditTab ? (
          <div className="relative">
            {showLoader && (
              <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="flex flex-col items-center gap-3">
                  <FontAwesomeIcon 
                    icon={faSpinner} 
                    className="h-8 w-8 text-primary animate-spin" 
                  />
                  <p className="text-sm text-muted-foreground">Loading...</p>
                </div>
              </div>
            )}
            <SectionForm initialData={section} isEdit={true} pageId={pageId || undefined} />
          </div>
        ) : (
          <div className="relative">
            {showLoader && (
              <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="flex flex-col items-center gap-3">
                  <FontAwesomeIcon 
                    icon={faSpinner} 
                    className="h-8 w-8 text-primary animate-spin" 
                  />
                  <p className="text-sm text-muted-foreground">Loading...</p>
                </div>
              </div>
            )}
            <SectionSocialPlatformsTab sectionId={section.id} pageId={pageId} initialSocialPlatforms={initialSocialPlatforms} />
          </div>
        )}
      </div>
    );
  }

  // For non-content sections (that don't have special tabs), always show Details tab (no items tab)
  if (!hasContentItems) {
    return (
      <div className="w-full">
        {/* Simple underlined tab navigation - only Details tab for non-content sections */}
        <nav className="border-b border-border mb-3">
          <div className="flex gap-6">
            <Link
              href={editHref}
              onClick={(e) => handleTabClick(e, editHref, "edit")}
              prefetch={true}
              className={cn(
                "pb-3 text-sm font-medium transition-colors",
                "text-foreground border-b-2 border-primary"
              )}
            >
              Details
            </Link>
          </div>
        </nav>
        <div className="relative">
          {showLoader && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="flex flex-col items-center gap-3">
                <FontAwesomeIcon 
                  icon={faSpinner} 
                  className="h-8 w-8 text-primary animate-spin" 
                />
                <p className="text-sm text-muted-foreground">Loading...</p>
              </div>
            </div>
          )}
          <SectionForm initialData={section} isEdit={true} pageId={pageId || undefined} />
        </div>
      </div>
    );
  }

  // For content sections, show Details and content-type-specific tab
  if (!contentTabInfo || !contentTabHref) {
    return null;
  }

  return (
    <div className="w-full relative">
      {/* Simple underlined tab navigation */}
      <nav className="border-b border-border mb-3">
        <div className="flex gap-6">
          <Link
            href={editHref}
            onClick={(e) => handleTabClick(e, editHref, "edit")}
            prefetch={true}
            className={cn(
              "pb-3 text-sm font-medium transition-colors",
              effectiveIsEditTab
                ? "text-foreground border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Details
          </Link>
          <Link
            href={contentTabHref}
            onClick={(e) => handleTabClick(e, contentTabHref!, contentTabInfo.tab)}
            prefetch={true}
            className={cn(
              "pb-3 text-sm font-medium transition-colors",
              effectiveIsContentTab
                ? "text-foreground border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {contentTabInfo.label}
          </Link>
        </div>
      </nav>

      {/* Content based on active tab */}
      {isEditTab ? (
        <div className="relative">
          {showLoader && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="flex flex-col items-center gap-3">
                <FontAwesomeIcon 
                  icon={faSpinner} 
                  className="h-8 w-8 text-primary animate-spin" 
                />
                <p className="text-sm text-muted-foreground">Loading...</p>
              </div>
            </div>
          )}
          <SectionForm initialData={section} isEdit={true} pageId={pageId || undefined} />
        </div>
      ) : (
        <div className="relative">
          {showLoader && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="flex flex-col items-center gap-3">
                <FontAwesomeIcon 
                  icon={faSpinner} 
                  className="h-8 w-8 text-primary animate-spin" 
                />
                <p className="text-sm text-muted-foreground">Loading...</p>
              </div>
            </div>
          )}
          {renderContentList()}
        </div>
      )}
    </div>
  );
}

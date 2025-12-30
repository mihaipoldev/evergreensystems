"use client";

import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBullseye } from "@fortawesome/free-solid-svg-icons";
import { RichText } from "@/components/ui/RichText";
import { PageSectionStatusSelector } from "@/features/page-builder/pages/components/PageSectionStatusSelector";
import { IconFromClass } from "@/components/admin/modals/IconFromClass";
import { cn } from "@/lib/utils";
import type { OfferFeature, OfferFeatureWithSection } from "../types";

type FeatureCardProps = {
  item: OfferFeature | OfferFeatureWithSection;
  showIcon?: boolean;
  showStatus?: boolean;
  onStatusChange?: (status: "published" | "draft" | "deactivated") => void;
  editHref?: string;
  variant?: "default" | "compact";
};

export function FeatureCard({
  item,
  showIcon = false,
  showStatus = false,
  onStatusChange,
  editHref,
  variant = "default",
}: FeatureCardProps) {
  const isCompact = variant === "compact";
  const isWithSection = "section_feature" in item;
  const status = isWithSection ? item.section_feature.status : undefined;

  // Title rendering - clickable if editHref provided
  const titleContent = editHref ? (
    <Link
      href={editHref}
      className={cn(
        "font-semibold text-foreground leading-snug hover:text-primary transition-colors cursor-pointer",
        isCompact ? "text-sm line-clamp-1" : "text-base"
      )}
    >
      {item.title}
    </Link>
  ) : (
    <h3
      className={cn(
        "font-semibold text-foreground",
        isCompact ? "text-sm line-clamp-1" : "text-base"
      )}
    >
      {item.title}
    </h3>
  );

  // Icon rendering
  const iconElement = showIcon && (
    <div
      className={cn(
        "rounded-full flex items-center justify-center flex-shrink-0",
        isCompact
          ? "h-10 w-10 bg-primary/10"
          : "h-12 w-12 bg-muted hidden md:flex shadow-md overflow-hidden"
      )}
    >
      <IconFromClass
        iconClass={item.icon}
        fallbackIcon={faBullseye}
        className={cn("text-primary", isCompact ? "h-5 w-5" : "h-6 w-6")}
      />
    </div>
  );

  // Status selector rendering
  const statusElement =
    showStatus && status && onStatusChange ? (
      <PageSectionStatusSelector status={status} onStatusChange={onStatusChange} />
    ) : null;

  if (isCompact) {
    // Compact variant: icon on left, content in middle, status on right
    return (
      <div className="flex items-center gap-3">
        {iconElement}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-2">
            {titleContent}
            {statusElement}
          </div>
          {item.subtitle && (
            <RichText
              text={item.subtitle}
              as="p"
              className="text-xs text-muted-foreground mb-1 leading-relaxed"
            />
          )}
          {item.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 mb-1">
              {item.description}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Default variant: vertical layout
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-start gap-3">
        {iconElement}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-1">
            {titleContent}
            {statusElement}
          </div>
          {item.subtitle && (
            <RichText
              text={item.subtitle}
              as="p"
              className="text-sm text-muted-foreground mb-1 leading-relaxed"
            />
          )}
          {item.description && (
            <RichText
              text={item.description}
              as="div"
              className="text-sm text-muted-foreground leading-relaxed line-clamp-2 md:line-clamp-3"
            />
          )}
        </div>
      </div>
    </div>
  );
}

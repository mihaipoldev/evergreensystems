"use client";

import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLink, faMousePointer } from "@fortawesome/free-solid-svg-icons";
import { PageSectionStatusSelector } from "@/features/page-builder/pages/components/PageSectionStatusSelector";
import { IconFromClass } from "@/components/admin/modals/IconFromClass";
import { cn } from "@/lib/utils";
import type { CTAButton, CTAButtonWithSection } from "../types";

type CTAButtonCardProps = {
  item: CTAButton | CTAButtonWithSection;
  showIcon?: boolean;
  showStatus?: boolean;
  onStatusChange?: (status: "published" | "draft" | "deactivated") => void;
  editHref?: string;
  variant?: "default" | "compact";
};

export function CTAButtonCard({
  item,
  showIcon = false,
  showStatus = false,
  onStatusChange,
  editHref,
  variant = "default",
}: CTAButtonCardProps) {
  const isCompact = variant === "compact";
  const isWithSection = "section_cta_button" in item;
  const status = isWithSection 
    ? (item.section_cta_button.status && ["published", "draft", "deactivated"].includes(item.section_cta_button.status)
        ? item.section_cta_button.status as "published" | "draft" | "deactivated"
        : "draft")
    : undefined;

  // Label rendering - clickable if editHref provided
  const labelContent = editHref ? (
    <Link
      href={editHref}
      className={cn(
        "font-semibold text-foreground leading-snug hover:text-primary transition-colors cursor-pointer",
        isCompact ? "text-sm line-clamp-1" : "text-base"
      )}
    >
      {item.label}
    </Link>
  ) : (
    <h3
      className={cn(
        "font-semibold text-foreground",
        isCompact ? "text-sm line-clamp-1" : "text-base"
      )}
    >
      {item.label}
    </h3>
  );

  // Icon rendering
  const iconElement = showIcon && (
    <div
      className={cn(
        "rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden",
        isCompact
          ? "h-10 w-10 bg-primary/10"
          : "h-12 w-12 bg-muted shadow-md"
      )}
    >
      <IconFromClass
        iconClass={item.icon}
        fallbackIcon={faMousePointer}
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
            {labelContent}
            {statusElement}
          </div>
          {item.subtitle && (
            <p className="text-xs text-muted-foreground mb-1">
              {item.subtitle}
            </p>
          )}
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5 truncate"
            onClick={(e) => e.stopPropagation()}
          >
            <FontAwesomeIcon icon={faLink} className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">{item.url}</span>
          </a>
          {item.style && (
            <div className="text-xs text-muted-foreground mt-1">
              Style: {item.style}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Default variant: vertical layout
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-start justify-between gap-3">
        {labelContent}
        {statusElement}
      </div>
      <div className="flex items-center gap-2">
        {item.icon && (
          <div className="h-8 w-8 rounded-full overflow-hidden flex items-center justify-center bg-muted flex-shrink-0">
            <IconFromClass
              iconClass={item.icon}
              fallbackIcon={faMousePointer}
              className="h-4 w-4 text-primary"
            />
          </div>
        )}
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5 truncate"
          onClick={(e) => e.stopPropagation()}
        >
          <FontAwesomeIcon icon={faLink} className="h-3 w-3 flex-shrink-0" />
          <span className="truncate">{item.url}</span>
        </a>
      </div>
      {item.style && (
        <div className="text-xs text-muted-foreground">
          Style: {item.style}
        </div>
      )}
      {item.subtitle && (
        <div className="text-sm text-muted-foreground">
          {item.subtitle}
        </div>
      )}
    </div>
  );
}

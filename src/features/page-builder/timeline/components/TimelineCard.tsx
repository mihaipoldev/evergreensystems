"use client";

import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faListOl } from "@fortawesome/free-solid-svg-icons";
import { Badge } from "@/components/ui/badge";
import { PageSectionStatusSelector } from "@/features/page-builder/pages/components/PageSectionStatusSelector";
import { IconFromClass } from "@/components/admin/modals/IconFromClass";
import { cn } from "@/lib/utils";
import type { Timeline, TimelineWithSection } from "../types";

type TimelineCardProps = {
  item: Timeline | TimelineWithSection;
  showIcon?: boolean;
  showStatus?: boolean;
  onStatusChange?: (status: "published" | "draft" | "deactivated") => void;
  editHref?: string;
  variant?: "default" | "compact";
};

export function TimelineCard({
  item,
  showIcon = false,
  showStatus = false,
  onStatusChange,
  editHref,
  variant = "default",
}: TimelineCardProps) {
  const isCompact = variant === "compact";
  const isWithSection = "section_timeline" in item;
  const status = isWithSection ? item.section_timeline.status : undefined;
  const stepNumber = isWithSection ? item.section_timeline.position + 1 : undefined;

  // Title rendering - clickable if editHref provided
  const titleContent = editHref ? (
    <Link
      href={editHref}
      className={cn(
        "font-semibold text-foreground leading-snug hover:text-primary transition-colors cursor-pointer block",
        isCompact ? "text-sm mb-1" : "text-base mb-1"
      )}
    >
      {item.title}
    </Link>
  ) : (
    <h3
      className={cn(
        "font-semibold text-foreground",
        isCompact ? "text-sm mb-1" : "text-base mb-1"
      )}
    >
      {item.title}
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
        fallbackIcon={faListOl}
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
      <div className="flex items-start gap-3">
        {iconElement}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="flex items-center gap-2">
              {stepNumber && (
                <Badge variant="outline" className="text-xs">
                  Step {stepNumber}
                </Badge>
              )}
              {item.badge && (
                <Badge className="text-xs">
                  {item.badge}
                </Badge>
              )}
            </div>
            {statusElement}
          </div>
          {titleContent}
          {item.subtitle && (
            <p className="text-xs text-muted-foreground">
              {item.subtitle}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Default variant: vertical layout
  return (
    <div className="flex items-start gap-3">
      {iconElement}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3 mb-1">
          <div className="flex items-center gap-2">
            {item.badge && (
              <Badge className="text-xs">
                {item.badge}
              </Badge>
            )}
          </div>
          {statusElement}
        </div>
        {titleContent}
        {item.subtitle && (
          <p className="text-sm text-muted-foreground">
            {item.subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

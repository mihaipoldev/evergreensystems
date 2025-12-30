"use client";

import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleQuestion } from "@fortawesome/free-solid-svg-icons";
import { RichText } from "@/components/ui/RichText";
import { PageSectionStatusSelector } from "@/features/page-builder/pages/components/PageSectionStatusSelector";
import { cn } from "@/lib/utils";
import type { FAQItem, FAQItemWithSection } from "../types";

type FAQCardProps = {
  item: FAQItem | FAQItemWithSection;
  showIcon?: boolean;
  showStatus?: boolean;
  onStatusChange?: (status: "published" | "draft" | "deactivated") => void;
  editHref?: string;
  variant?: "default" | "compact";
};

export function FAQCard({
  item,
  showIcon = false,
  showStatus = false,
  onStatusChange,
  editHref,
  variant = "default",
}: FAQCardProps) {
  const isCompact = variant === "compact";
  const isWithSection = "section_faq_item" in item;
  const status = isWithSection ? item.section_faq_item.status : undefined;

  // Question rendering - clickable if editHref provided
  const questionContent = editHref ? (
    <Link
      href={editHref}
      className={cn(
        "font-semibold text-foreground leading-snug hover:text-primary transition-colors cursor-pointer",
        isCompact ? "text-sm line-clamp-1" : "text-base"
      )}
    >
      {item.question}
    </Link>
  ) : (
    <h3
      className={cn(
        "font-semibold text-foreground",
        isCompact ? "text-sm line-clamp-1" : "text-base"
      )}
    >
      {item.question}
    </h3>
  );

  // Icon rendering
  const iconElement = showIcon && (
    <div
      className={cn(
        "rounded-full flex items-center justify-center flex-shrink-0",
        isCompact
          ? "h-10 w-10 bg-primary/10"
          : "h-12 w-12 bg-muted hidden md:flex shadow-md"
      )}
    >
      <FontAwesomeIcon
        icon={faCircleQuestion}
        className={cn(
          "text-primary",
          isCompact ? "h-5 w-5" : "h-6 w-6"
        )}
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
            {questionContent}
            {statusElement}
          </div>
          <RichText
            text={item.answer}
            as="p"
            className="text-xs text-muted-foreground leading-relaxed"
          />
        </div>
      </div>
    );
  }

  // Default variant: vertical layout, no icon (or hidden on mobile), no status
  return (
    <div className="flex flex-col gap-2">
      {iconElement && <div className="hidden md:block">{iconElement}</div>}
      <div className="flex items-start justify-between gap-3">
        {questionContent}
        {statusElement}
      </div>
      <RichText
        text={item.answer}
        as="div"
        className="text-sm text-muted-foreground leading-relaxed"
      />
    </div>
  );
}

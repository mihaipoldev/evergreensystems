"use client";

import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartLine } from "@fortawesome/free-solid-svg-icons";
import { cn } from "@/lib/utils";
import type { Result, ResultWithSection } from "../types";

type ResultCardProps = {
  item: Result | ResultWithSection;
  showIcon?: boolean;
  showStatus?: boolean;
  onStatusChange?: (status: "published" | "draft" | "deactivated") => void;
  editHref?: string;
  variant?: "default" | "compact";
};

export function ResultCard({
  item,
  showIcon = false,
  showStatus = false,
  onStatusChange,
  editHref,
  variant = "default",
}: ResultCardProps) {
  const isCompact = variant === "compact";
  const isWithSection = "section_result" in item;

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
      <FontAwesomeIcon
        icon={faChartLine}
        className={cn("text-primary", isCompact ? "h-5 w-5" : "h-6 w-6")}
      />
    </div>
  );

  // Title/label rendering - clickable if editHref provided
  const titleContent = editHref ? (
    <Link
      href={editHref}
      className={cn(
        "font-semibold text-foreground leading-snug hover:text-primary transition-colors cursor-pointer block",
        isCompact ? "text-sm mb-1" : "text-base mb-1"
      )}
    >
      Result Item
    </Link>
  ) : null;

  // Content rendering
  const contentDisplay = (
    <pre className={cn(
      "font-mono line-clamp-2 whitespace-pre-wrap font-sans text-muted-foreground",
      isCompact ? "text-xs" : "text-sm"
    )}>
      {JSON.stringify(item.content, null, 2)}
    </pre>
  );

  if (isCompact) {
    // Compact variant: icon on left, content in middle
    return (
      <div className="flex items-start gap-3">
        {iconElement}
        <div className="flex-1 min-w-0">
          {titleContent}
          {contentDisplay}
        </div>
      </div>
    );
  }

  // Default variant: vertical layout
  return (
    <div className="flex items-start gap-3">
      {iconElement}
      <div className="flex-1 min-w-0">
        {titleContent}
        {contentDisplay}
      </div>
    </div>
  );
}

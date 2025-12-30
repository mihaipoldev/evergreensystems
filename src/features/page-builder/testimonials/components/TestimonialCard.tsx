"use client";

import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faQuoteLeft, faStar, faStarHalfStroke } from "@fortawesome/free-solid-svg-icons";
import { RichText } from "@/components/ui/RichText";
import { PageSectionStatusSelector } from "@/features/page-builder/pages/components/PageSectionStatusSelector";
import { IconFromClass } from "@/components/admin/modals/IconFromClass";
import { cn } from "@/lib/utils";
import type { Testimonial, TestimonialWithSection } from "../types";

type TestimonialCardProps = {
  item: Testimonial | TestimonialWithSection;
  showIcon?: boolean;
  showStatus?: boolean;
  onStatusChange?: (status: "published" | "draft" | "deactivated") => void;
  editHref?: string;
  variant?: "default" | "compact";
};

export const renderStars = (rating: number) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(fullStars)].map((_, i) => (
        <FontAwesomeIcon
          key={`full-${i}`}
          icon={faStar}
          className="text-yellow-500"
          size="xs"
        />
      ))}
      {hasHalfStar && (
        <FontAwesomeIcon
          key="half"
          icon={faStarHalfStroke}
          className="text-yellow-500"
          size="xs"
        />
      )}
      {[...Array(5 - Math.ceil(rating))].map((_, i) => (
        <FontAwesomeIcon
          key={`empty-${i}`}
          icon={faStar}
          className="text-gray-300"
          size="xs"
        />
      ))}
    </div>
  );
};

export function TestimonialCard({
  item,
  showIcon = false,
  showStatus = false,
  onStatusChange,
  editHref,
  variant = "default",
}: TestimonialCardProps) {
  const isCompact = variant === "compact";
  const isWithSection = "section_testimonial" in item;
  const status = isWithSection ? item.section_testimonial.status : undefined;

  // Author name rendering - clickable if editHref provided
  const authorContent = editHref ? (
    <Link
      href={editHref}
      className={cn(
        "font-semibold text-foreground leading-snug hover:text-primary transition-colors cursor-pointer",
        isCompact ? "text-sm" : "text-base"
      )}
    >
      {item.author_name}
      {item.author_role && (
        <span className="text-muted-foreground font-normal"> • {item.author_role}</span>
      )}
    </Link>
  ) : (
    <h3 className={cn("font-semibold text-foreground", isCompact ? "text-sm" : "text-base")}>
      {item.author_name}
      {item.author_role && (
        <span className="text-muted-foreground font-normal"> • {item.author_role}</span>
      )}
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
      {isCompact ? (
        <FontAwesomeIcon icon={faQuoteLeft} className="h-5 w-5 text-primary" />
      ) : (
        <IconFromClass
          iconClass={(item as any).icon}
          fallbackIcon={faQuoteLeft}
          className="h-6 w-6 !text-primary"
        />
      )}
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
            <div>
              {authorContent}
              {item.rating && (
                <div className="mt-1">{renderStars(item.rating)}</div>
              )}
            </div>
            {statusElement}
          </div>
          {(item.headline || item.quote) && (
            <div>
              {item.headline && (
                <p className="text-xs font-bold text-foreground mb-1">
                  {item.headline}
                </p>
              )}
              {item.quote && (
                <RichText
                  text={item.quote}
                  as="p"
                  className="text-xs text-muted-foreground line-clamp-2 leading-relaxed"
                />
              )}
            </div>
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
        <div className="flex items-start justify-between gap-3 mb-0.5">
          {authorContent}
          {statusElement}
        </div>
        {(item.author_role || item.company_name) && (
          <p className={cn("text-muted-foreground mb-3", isCompact ? "text-xs" : "text-sm")}>
            {item.author_role && item.company_name
              ? `${item.author_role} at ${item.company_name}`
              : item.author_role || item.company_name}
          </p>
        )}
        {item.headline && (
          <p className={cn("font-semibold text-foreground", isCompact ? "text-xs" : "text-sm")}>
            {item.headline}
          </p>
        )}
        {item.quote && (
          <p className={cn("text-muted-foreground leading-relaxed line-clamp-2 md:line-clamp-3", isCompact ? "text-xs" : "text-sm")}>
            {item.quote}
          </p>
        )}
        {item.rating && (
          <div className="flex gap-0.5 mt-2">
            {[...Array(Math.floor(item.rating))].map((_, i) => (
              <FontAwesomeIcon
                key={`full-${i}`}
                icon={faStar}
                className="w-3.5 h-3.5 text-yellow-400"
              />
            ))}
            {item.rating % 1 >= 0.5 && (
              <FontAwesomeIcon
                key="half"
                icon={faStarHalfStroke}
                className="w-3.5 h-3.5 text-yellow-400"
              />
            )}
            {[...Array(5 - Math.ceil(item.rating))].map((_, i) => (
              <FontAwesomeIcon
                key={`empty-${i}`}
                icon={faStar}
                className="w-3.5 h-3.5 text-yellow-400 opacity-30"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

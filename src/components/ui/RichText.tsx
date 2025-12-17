import React from "react";
import { formatRichText } from "@/lib/formatRichText";
import { cn } from "@/lib/utils";

export interface RichTextProps {
  text: string;
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "div" | "span";
  className?: string;
  style?: React.CSSProperties;
}

export function RichText({ text, as = "p", className, style }: RichTextProps) {
  const Tag = as;

  return (
    <Tag
      className={cn("rich-text-content", className)}
      style={style}
      dangerouslySetInnerHTML={{ __html: formatRichText(text) }}
    />
  );
}

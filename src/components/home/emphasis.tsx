// Renders text with inline `**bold**` markers as <b> elements.
// Mirrors the lightweight markup convention already used in the codebase
// (home.ts uses [[**...**]]); here we keep it to plain ** for the new content.
import { Fragment, type ReactNode } from "react";

export function renderEmphasis(text: string): ReactNode {
  return text.split(/\*\*(.+?)\*\*/g).map((part, i) =>
    i % 2 === 1 ? <b key={i}>{part}</b> : <Fragment key={i}>{part}</Fragment>,
  );
}

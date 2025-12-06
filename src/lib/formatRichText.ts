/**
 * Format rich text by converting markers to HTML
 * Supports: [[primary]], {{secondary}}, **bold**, *italic*
 */
export function formatRichText(text: string): string {
  let html = text
    // Process bold before italic to avoid conflicts
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Process primary and secondary highlights
    .replace(/\[\[(.*?)\]\]/g, '<span class="text-primary font-semibold">$1</span>')
    .replace(/\{\{(.*?)\}\}/g, '<span class="text-secondary font-semibold">$1</span>');

  return html;
}

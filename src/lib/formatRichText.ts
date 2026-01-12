/**
 * Format rich text by converting markers to HTML
 * Supports: [[primary]], {{secondary}}, **bold**, *italic*, newlines
 * 
 * Note: We convert newlines to <br /> tags. For line-clamp compatibility,
 * the RichText component should use white-space: pre-line CSS when line-clamp
 * is not used, or wrap lines in block elements when line-clamp is needed.
 */
export function formatRichText(text: string): string {
  const html = text
    // Process bold before italic to avoid conflicts
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Process primary highlight with gradient (primary to secondary)
    .replace(/\[\[(.*?)\]\]/g, '<span class="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">$1</span>')
    .replace(/\{\{(.*?)\}\}/g, '<span class="text-secondary">$1</span>')
    // Convert newlines to <br /> tags
    .replace(/\n/g, '<br />');

  return html;
}

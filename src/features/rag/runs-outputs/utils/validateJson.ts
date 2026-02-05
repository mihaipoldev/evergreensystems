/**
 * Validate and parse a JSON string. Returns parsed value or error message.
 * Empty string is treated as valid "null" for optional fields.
 */
export function parseJsonOptional(
  value: string
): { data: unknown; error: null } | { data: null; error: string } {
  const trimmed = value.trim();
  if (trimmed === "") {
    return { data: null, error: null };
  }
  try {
    const parsed = JSON.parse(value) as unknown;
    return { data: parsed, error: null };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Invalid JSON";
    return { data: null, error: message };
  }
}

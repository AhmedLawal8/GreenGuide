export function formatListField(value: string | null): string | null {
  if (!value) return value;
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed.join(", ");
  } catch {
    // Not JSON-encoded — use the raw value as-is.
  }
  return value;
}

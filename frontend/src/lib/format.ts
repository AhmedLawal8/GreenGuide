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

export function formatPhRange(min: number | null, max: number | null): string {
  if (min == null && max == null) return "Not specified";
  if (min != null && max != null) return `${min} – ${max}`;
  if (min != null) return `≥ ${min}`;
  return `≤ ${max}`;
}

export function formatHeight(value: string | null): string {
  if (!value) return "Not specified";
  return /^\d+(\.\d+)?$/.test(value.trim()) ? `${value} ft` : value;
}

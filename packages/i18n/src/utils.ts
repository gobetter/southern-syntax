export function getLocalizedString(
  value: unknown,
  locale: string
): string | undefined {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const record = value as Record<string, string | undefined>;
    return record[locale];
  }
  return undefined;
}

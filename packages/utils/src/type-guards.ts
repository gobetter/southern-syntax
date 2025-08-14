import type { LocalizedString } from "@southern-syntax/types";

/**
 * Coerces an unknown value into a LocalizedString type.
 * This is a safe way to handle Prisma's JsonValue type.
 * @param value The value to coerce, expected to be Prisma.JsonValue.
 * @returns A valid LocalizedString object, or an empty object if the input is invalid.
 */
export function toLocalizedString(value: unknown): LocalizedString {
  if (typeof value === "object" && value !== null) {
    // We can add more robust checks here if needed in the future
    return value as LocalizedString;
  }
  return {};
}

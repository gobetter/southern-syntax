import { getLocalizedString } from "@southern-syntax/i18n";
import type { LocalizedString, SelectOption } from "@southern-syntax/types";

export function mapToSelectOptions<T extends { id: string }>(
  items: T[] | undefined,
  locale: string,
  getName: (item: T) => unknown,
  getFallback: (item: T) => string
): SelectOption[] {
  return (
    items?.map((item) => ({
      id: item.id,
      label:
        getLocalizedString(getName(item) as LocalizedString, locale) ||
        getFallback(item),
    })) ?? []
  );
}

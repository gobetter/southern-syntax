import { getLocalizedString } from "@southern-syntax/i18n";
import type { LocalizedString, SelectOption } from "@southern-syntax/types";

const getLocalized = getLocalizedString as (
  value: LocalizedString | undefined,
  locale: string
) => string | undefined;

export function mapToSelectOptions<T extends { id: string }>(
  items: T[] | undefined,
  locale: string,
  getName: (item: T) => LocalizedString | undefined,
  getFallback: (item: T) => string
): SelectOption[] {
  return (
    items?.map((item) => {
      const name = getName(item);
      return {
        id: item.id,
        label: getLocalized(name, locale) ?? getFallback(item),
      };
    }) ?? []
  );
}

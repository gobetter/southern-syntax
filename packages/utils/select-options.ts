import { getLocalizedString } from '@/i18n/utils';
import type { LocalizedString } from '@/types/i18n';
import type { SelectOption } from '@/lib/options';

export function mapToSelectOptions<T extends { id: string }>(
  items: T[] | undefined,
  locale: string,
  getName: (item: T) => unknown,
  getFallback: (item: T) => string,
): SelectOption[] {
  return (
    items?.map((item) => ({
      id: item.id,
      label: getLocalizedString(getName(item) as LocalizedString, locale) || getFallback(item),
    })) ?? []
  );
}

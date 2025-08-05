// lib/mapTaxonomy.ts
import { LocalizedString } from '@/types/i18n';

export interface TaxonomyBase {
  id: string;
  name: unknown;
}

export interface TaxonomyWithSlug extends TaxonomyBase {
  slug: string;
}

export type TaxonomyData = TaxonomyBase | TaxonomyWithSlug;

export type MapTaxonomyResult<T extends TaxonomyData> = T extends TaxonomyWithSlug
  ? { id: string; slug: string; name: LocalizedString }
  : { id: string; name: LocalizedString };

export function mapTaxonomy<T extends TaxonomyData>(data?: T[]): MapTaxonomyResult<T>[] {
  return (data ?? []).map((item) => {
    const base = { id: item.id, name: item.name as LocalizedString };
    return ('slug' in item ? { ...base, slug: item.slug } : base) as MapTaxonomyResult<T>;
  });
}

export function mapIdName<T extends { id: string; name: LocalizedString }>(items: T[] | undefined) {
  return (items ?? []).map((item) => ({ id: item.id, name: item.name }));
}

export function mapIdSlugName<T extends { id: string; slug?: string; name: LocalizedString }>(
  items: T[] | undefined,
) {
  return (items ?? []).map((item) => ({ id: item.id, slug: item.slug, name: item.name }));
}

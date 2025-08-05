import { describe, it, expect } from 'vitest';
import { mapTaxonomy, mapIdName, mapIdSlugName } from '../mapTaxonomy';

describe('mapTaxonomy', () => {
  it('maps taxonomy with slug', () => {
    const input = [{ id: '1', name: { en: 'Cat' }, slug: 'cat' }];
    const result = mapTaxonomy(input);
    expect(result).toEqual([{ id: '1', name: { en: 'Cat' }, slug: 'cat' }]);
  });

  it('returns empty array for undefined', () => {
    expect(mapTaxonomy(undefined)).toEqual([]);
  });
});

describe('mapIdName', () => {
  it('maps id and name only', () => {
    const items = [{ id: '1', name: { en: 'Dog' } }];
    expect(mapIdName(items)).toEqual([{ id: '1', name: { en: 'Dog' } }]);
  });
});

describe('mapIdSlugName', () => {
  it('maps id, slug, and name', () => {
    const items = [{ id: '1', slug: 'dog', name: { en: 'Dog' } }];
    expect(mapIdSlugName(items)).toEqual([{ id: '1', slug: 'dog', name: { en: 'Dog' } }]);
  });
});

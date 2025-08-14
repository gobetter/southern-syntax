import { LocalizedString } from './i18n';

export interface Category {
  id: string;
  slug: string;
  name: LocalizedString;
}

export interface Tag {
  id: string;
  slug: string;
  name: LocalizedString;
}

export interface MediaCategory {
  id: string;
  name: LocalizedString;
}

export interface MediaTag {
  id: string;
  name: LocalizedString;
}

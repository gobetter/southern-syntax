import type { LocalizedString } from "./i18n";
import type { Category, Tag } from "./media-taxonomy";

export interface File {
  filename: string;
  encoding: string;
  mimeType: string;
  content: Buffer;
}

export interface MediaItem {
  id: string;
  filename: string;
  mimeType: string;
  fileSize: number;
  originalUrl: string;
  variants?: Record<string, string>;
  title: LocalizedString | null;
  altText: LocalizedString | null;
  caption: LocalizedString | null;
  createdAt: string;
  categories: Category[];
  tags: Tag[];
}

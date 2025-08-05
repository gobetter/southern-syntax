// src/components/admin/media/EditMediaDialog/mediaToFormValues.ts
import { MediaUpdateFormInput } from '@/schemas/media';
import { MediaItem } from '@/types/trpc';
import { LocalizedString } from '@/types/i18n';

export function mediaToFormValues(media: MediaItem): MediaUpdateFormInput {
  return {
    title: (media.title as LocalizedString) || {},
    altText: (media.altText as LocalizedString) || {},
    caption: (media.caption as LocalizedString) || {},
    categoryIds: media.categories.map((cat: { id: string }) => cat.id),
    tagIds: media.tags.map((tag: { id: string }) => tag.id),
  };
}

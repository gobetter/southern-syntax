// src/components/admin/media/EditMediaDialog/mediaToFormValues.ts
import { MediaUpdateFormInput } from "@southern-syntax/schemas/media";
import { MediaItem } from "@/types/trpc";
import { LocalizedString } from "@southern-syntax/types";
// import { toLocalizedString } from "@southern-syntax/utils";

export function mediaToFormValues(media: MediaItem): MediaUpdateFormInput {
  return {
    // title: toLocalizedString(media.title),
    title: (media.title as unknown as LocalizedString) || {},
    altText: (media.altText as LocalizedString) || {},
    caption: (media.caption as LocalizedString) || {},
    categoryIds: media.categories.map((cat: { id: string }) => cat.id),
    tagIds: media.tags.map((tag: { id: string }) => tag.id),
  };
}

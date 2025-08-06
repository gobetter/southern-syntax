import { MediaUpdateFormInput } from "@southern-syntax/schemas/media";
import type { MediaItem } from "@/types/trpc";
// import { LocalizedString } from "@southern-syntax/types";
import { toLocalizedString } from "@southern-syntax/utils";

export function mediaToFormValues(media: MediaItem): MediaUpdateFormInput {
  return {
    title: toLocalizedString(media.title),
    altText: toLocalizedString(media.altText),
    caption: toLocalizedString(media.caption),
    categoryIds: media.categories.map((cat) => cat.id),
    tagIds: media.tags.map((tag) => tag.id),
  };
}

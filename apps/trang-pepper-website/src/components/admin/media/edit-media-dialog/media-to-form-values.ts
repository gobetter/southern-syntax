import type { MediaUpdateFormInput } from "@southern-syntax/schemas/media";
import { toLocalizedString } from "@southern-syntax/utils";
// import type { MediaItem } from "@southern-syntax/types";
import type { MediaItem } from "@/types/trpc";

export function mediaToFormValues(media: MediaItem): MediaUpdateFormInput {
  return {
    title: toLocalizedString(media.title),
    altText: toLocalizedString(media.altText),
    caption: toLocalizedString(media.caption),
    categoryIds: media.categories.map((cat) => cat.id),
    tagIds: media.tags.map((tag) => tag.id),
  };
}

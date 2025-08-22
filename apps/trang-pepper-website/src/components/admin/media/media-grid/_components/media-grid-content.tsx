"use client";

import { useLocale } from "next-intl";

// import type { MediaItem } from "@southern-syntax/types";
import type { MediaItem } from "@/types/trpc";

import MediaCard from "../../media-card";

interface MediaGridContentProps {
  mediaItems: MediaItem[];
  selectedIds: Set<string>;
  onEditAction: (media: MediaItem) => void;
  onViewDetailsAction: (media: MediaItem) => void;
  onPreviewAction: (media: MediaItem) => void;
  onToggleSelectAction: (id: string, selected: boolean) => void;
  onDeleteRequestAction: (media: MediaItem) => void;
}

export default function MediaGridContent({
  mediaItems,
  selectedIds,
  onEditAction,
  onViewDetailsAction,
  onPreviewAction,
  onToggleSelectAction,
  onDeleteRequestAction,
}: MediaGridContentProps) {
  const locale = useLocale();

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {mediaItems.map((media) => (
        <MediaCard
          key={media.id}
          media={media}
          locale={locale}
          isSelected={selectedIds.has(media.id)}
          onEditAction={() => onEditAction(media)}
          onViewDetailsAction={() => onViewDetailsAction(media)}
          onPreviewAction={() => onPreviewAction(media)}
          onSelectionChangeAction={onToggleSelectAction}
          onDeleteAction={() => onDeleteRequestAction(media)}
        />
      ))}
    </div>
  );
}

// src/components/admin/media/MediaGrid/MediaGridContent.tsx
'use client';

import { useLocale } from 'next-intl';

import { MediaItem } from '@/types/trpc';

import MediaCard from '../../MediaCard';

interface MediaGridContentProps {
  mediaItems: MediaItem[];
  selectedIds: Set<string>;
  onEdit: (media: MediaItem) => void;
  onViewDetails: (media: MediaItem) => void;
  onPreview: (media: MediaItem) => void;
  onToggleSelect: (id: string, selected: boolean) => void;
  onDeleteRequest: (media: MediaItem) => void;
}

export default function MediaGridContent({
  mediaItems,
  selectedIds,
  onEdit,
  onViewDetails,
  onPreview,
  onToggleSelect,
  onDeleteRequest,
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
          onEdit={() => onEdit(media)}
          onViewDetails={() => onViewDetails(media)}
          onPreview={() => onPreview(media)}
          onSelectionChange={onToggleSelect}
          onDelete={() => onDeleteRequest(media)}
        />
      ))}
    </div>
  );
}

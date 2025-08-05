// src/components/admin/media/MediaGrid/MediaGrid.tsx
'use client';

import { MediaItem } from '@/types/trpc';

import MediaGridWrapper from './MediaGridWrapper';

interface MediaGridProps {
  mediaItems: MediaItem[];
  onEdit: (media: MediaItem) => void;
  onViewDetails: (media: MediaItem) => void;
  onPreview: (media: MediaItem) => void;
}

export default function MediaGrid(props: MediaGridProps) {
  return <MediaGridWrapper {...props} />;
}

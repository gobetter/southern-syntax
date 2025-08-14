"use client";

// import type { MediaItem } from "@southern-syntax/types";
import type { MediaItem } from "@/types/trpc";

import MediaGridWrapper from "./MediaGridWrapper";

interface MediaGridProps {
  mediaItems: MediaItem[];
  onEditAction: (media: MediaItem) => void;
  onViewDetailsAction: (media: MediaItem) => void;
  onPreviewAction: (media: MediaItem) => void;
}

export default function MediaGrid(props: MediaGridProps) {
  return <MediaGridWrapper {...props} />;
}

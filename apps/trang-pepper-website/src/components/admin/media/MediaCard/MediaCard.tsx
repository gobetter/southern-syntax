"use client";

import Image from "next/image";

// import type { MediaItem } from "@southern-syntax/types";
import type { MediaItem } from "@/types/trpc";

import { getLocalizedString } from "@southern-syntax/i18n";
import { parseVariantRecord } from "@southern-syntax/utils";
import { Card, CardContent, CardFooter, Checkbox } from "@southern-syntax/ui";

import MediaDropdown from "./_components/MediaDropdown";

interface MediaCardProps {
  media: MediaItem;
  locale: string;
  isSelected: boolean;
  onSelectionChangeAction: (id: string, selected: boolean) => void;
  onEditAction: () => void;
  onPreviewAction: () => void;
  onViewDetailsAction: () => void;
  onDeleteAction: () => void;
}

export default function MediaCard({
  media,
  locale,
  isSelected,
  onSelectionChangeAction,
  onEditAction,
  onPreviewAction,
  onViewDetailsAction,
  onDeleteAction,
}: MediaCardProps) {
  const variants = parseVariantRecord(media.variants);
  const thumbnailUrl = variants?.["thumbnail"] || media.originalUrl;

  return (
    <Card className="group relative overflow-hidden">
      <CardContent
        className="p-0"
        onClick={onPreviewAction}
        style={{ cursor: "pointer" }}
      >
        <div className="relative aspect-square w-full">
          <Image
            src={thumbnailUrl}
            alt={media.filename}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            unoptimized
          />
          <div className="absolute inset-0 bg-black/20 opacity-0 transition-opacity group-hover:opacity-100" />
        </div>
      </CardContent>

      <CardFooter
        className="flex cursor-pointer items-center justify-between bg-white p-2 dark:bg-gray-900"
        onClick={onViewDetailsAction}
      >
        <p
          className="truncate text-xs font-medium"
          title={getLocalizedString(media.title, locale) || media.filename}
        >
          {getLocalizedString(media.title, locale) || media.filename}
        </p>
      </CardFooter>

      <div className="absolute top-2 left-2 z-10">
        <Checkbox
          checked={isSelected}
          onCheckedChange={(checked) =>
            onSelectionChangeAction(media.id, !!checked)
          }
          className="text-primary-600 focus:ring-primary-500 h-5 w-5 rounded border-gray-300 bg-white/80"
        />
      </div>

      <div className="absolute top-2 right-2 z-10 opacity-0 transition-opacity group-hover:opacity-100">
        {/* ส่ง onDelete ที่ได้รับมาไปให้ Dropdown */}
        <MediaDropdown
          onEditAction={onEditAction}
          onDeleteAction={onDeleteAction}
        />
      </div>
    </Card>
  );
}

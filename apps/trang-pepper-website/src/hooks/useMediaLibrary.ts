// src/hooks/useMediaLibrary.ts
import { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { MediaItem } from '@/types/trpc';
import { trpc } from '@/lib/trpc-client';
import { useUpdateQuery } from '@/hooks/useUpdateQuery';
import { useDebounce } from '@/hooks/useDebounce';
import { mapIdName } from '@/lib/mapTaxonomy';
import type { LocalizedString } from '@/types/i18n';
import { MediaSortableField, MEDIA_SORT_OPTIONS } from '@/constants/media';
// import { SortOrder } from '@/constants/common';
import type { SortOrder } from '@/constants/common';
import { MediaCategory, MediaTag } from '@/types/media-taxonomy';

export function useMediaLibrary() {
  const searchParams = useSearchParams();
  const updateQuery = useUpdateQuery();
  const utils = trpc.useUtils();
  const t_media = useTranslations('admin_media');

  // --- State from URL ---
  const page = Number(searchParams.get('page')) || 1;
  const pageSize = Number(searchParams.get('pageSize')) || 10;
  const searchQuery = searchParams.get('q') || '';
  const categoryId = searchParams.get('categoryId') || undefined;
  const tagId = searchParams.get('tagId') || undefined;
  const sortBy = (searchParams.get('sortBy') as MediaSortableField) || 'createdAt';
  const sortOrder = (searchParams.get('sortOrder') as SortOrder) || 'desc';

  // --- Local UI State ---
  const [inputValue, setInputValue] = useState(searchQuery);
  const debouncedSearchQuery = useDebounce(inputValue, 500);
  const [isUploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [editingMedia, setEditingMedia] = useState<MediaItem | null>(null);
  const [viewingMedia, setViewingMedia] = useState<MediaItem | null>(null); // สำหรับ Sidebar
  const [previewingMedia, setPreviewingMedia] = useState<MediaItem | null>(null); // สำหรับ Preview
  const searchInputRef = useRef<HTMLInputElement>(null);

  // --- tRPC Queries ---
  const { data: categoriesData } = trpc.mediaCategory.getAll.useQuery();
  const { data: tagsData } = trpc.mediaTag.getAll.useQuery();
  const {
    data: mediaResult,
    isLoading,
    isError,
    error,
  } = trpc.media.getAll.useQuery({
    searchQuery: debouncedSearchQuery,
    page,
    pageSize,
    categoryId,
    tagId,
    sortBy,
    sortOrder,
  });

  // --- Memoized Derived State ---
  const mediaItems = mediaResult?.data;
  const totalCount = mediaResult?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  const categoryOptions = useMemo<MediaCategory[]>(
    () => mapIdName(categoriesData as Array<{ id: string; name: LocalizedString }> | undefined),
    [categoriesData],
  );

  const tagOptions = useMemo<MediaTag[]>(
    () => mapIdName(tagsData as Array<{ id: string; name: LocalizedString }> | undefined),
    [tagsData],
  );

  // --- Effects ---
  useEffect(() => {
    if (debouncedSearchQuery !== searchQuery) {
      updateQuery({ q: debouncedSearchQuery || null, page: 1 });
    }
  }, [debouncedSearchQuery, searchQuery, updateQuery]);

  useEffect(() => {
    if (!isLoading && page > totalPages && totalPages > 0) {
      updateQuery({ page: totalPages });
    }
  }, [isLoading, page, totalPages, updateQuery]);

  // --- Handlers ---
  const handleUploadSuccess = () => {
    utils.media.getAll.invalidate();
  };

  const handleEditRequest = (media: MediaItem | null) => {
    if (!media) return;
    setViewingMedia(null);
    setEditingMedia(media);
  };

  // เตรียม Options สำหรับ SortDropdown
  const mediaSortOptions = useMemo(
    () =>
      MEDIA_SORT_OPTIONS.map((option) => ({
        value: option.value,
        label: t_media(option.i18nKey),
      })),
    [t_media],
  );

  // --- Return Values ---
  return {
    page,
    pageSize,
    sortBy,
    sortOrder,
    categoryId,
    tagId,
    isLoading,
    isError,
    error,
    mediaItems,
    totalCount,
    categoryOptions,
    tagOptions,
    editingMedia,
    viewingMedia,
    isUploadDialogOpen,
    inputValue,
    searchInputRef,
    updateQuery,
    setInputValue,
    setUploadDialogOpen,
    setEditingMedia,
    setViewingMedia,
    previewingMedia,
    setPreviewingMedia,
    handleEditRequest,
    handleUploadSuccess,
    mediaSortOptions,
  };
}

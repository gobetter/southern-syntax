import {
  useState,
  useEffect,
  useRef,
  useMemo,
  type Dispatch,
  type SetStateAction,
  type RefObject,
} from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

import { useDebounce } from "@southern-syntax/hooks";
import { useUpdateQuery } from "@southern-syntax/hooks-next/use-update-query";
import { mapIdName } from "@southern-syntax/utils";
import type { MediaCategory, MediaTag } from "@southern-syntax/types";
import type { MediaItem } from "@/types/trpc";
import type { LocalizedString } from "@southern-syntax/types";
import { MEDIA_SORT_OPTIONS } from "@southern-syntax/constants/media";
import type { MediaSortableField } from "@southern-syntax/constants/media";
import type { SortOrder } from "@southern-syntax/types";

import type { AppRouter } from "@/server/routers/_app";
import { trpc } from "@/lib/trpc-client";
import type { TRPCClientErrorLike } from "@trpc/client";

interface UseMediaLibraryReturn {
  page: number;
  pageSize: number;
  sortBy: MediaSortableField;
  sortOrder: SortOrder;
  categoryId?: string;
  tagId?: string;
  isLoading: boolean;
  isError: boolean;
  error: TRPCClientErrorLike<AppRouter> | null;
  mediaItems?: MediaItem[];
  totalCount: number;
  categoryOptions: MediaCategory[];
  tagOptions: MediaTag[];
  editingMedia: MediaItem | null;
  viewingMedia: MediaItem | null;
  isUploadDialogOpen: boolean;
  inputValue: string;
  searchInputRef: RefObject<HTMLInputElement | null>;
  updateQuery: (params: Record<string, string | number | null>) => void;
  setInputValue: Dispatch<SetStateAction<string>>;
  setUploadDialogOpen: Dispatch<SetStateAction<boolean>>;
  setEditingMedia: Dispatch<SetStateAction<MediaItem | null>>;
  setViewingMedia: Dispatch<SetStateAction<MediaItem | null>>;
  previewingMedia: MediaItem | null;
  setPreviewingMedia: Dispatch<SetStateAction<MediaItem | null>>;
  handleEditRequest: (media: MediaItem | null) => void;
  handleUploadSuccess: () => void;
  mediaSortOptions: { value: MediaSortableField; label: string }[];
}

export function useMediaLibrary(): UseMediaLibraryReturn {
  const searchParams = useSearchParams();
  const updateQuery = useUpdateQuery();
  const utils = trpc.useUtils();
  const t_media = useTranslations("admin_media");

  // --- State from URL ---
  const page = Number(searchParams.get("page")) || 1;
  const pageSize = Number(searchParams.get("pageSize")) || 10;
  const searchQuery = searchParams.get("q") || "";
  const categoryId = searchParams.get("categoryId") || undefined;
  const tagId = searchParams.get("tagId") || undefined;
  const sortBy =
    (searchParams.get("sortBy") as MediaSortableField) || "createdAt";
  const sortOrder = (searchParams.get("sortOrder") as SortOrder) || "desc";

  // --- Local UI State ---
  const [inputValue, setInputValue] = useState(searchQuery);
  const debouncedSearchQuery = useDebounce(inputValue, 500);
  const [isUploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [editingMedia, setEditingMedia] = useState<MediaItem | null>(null);
  const [viewingMedia, setViewingMedia] = useState<MediaItem | null>(null); // สำหรับ Sidebar
  const [previewingMedia, setPreviewingMedia] = useState<MediaItem | null>(
    null
  ); // สำหรับ Preview
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
  const mediaItems = mediaResult?.data as MediaItem[] | undefined;
  const totalCount = mediaResult?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  const categoryOptions = useMemo<MediaCategory[]>(
    () =>
      mapIdName(
        categoriesData as
          | Array<{ id: string; name: LocalizedString }>
          | undefined
      ),
    [categoriesData]
  );

  const tagOptions = useMemo<MediaTag[]>(
    () =>
      mapIdName(
        tagsData as Array<{ id: string; name: LocalizedString }> | undefined
      ),
    [tagsData]
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
    [t_media]
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

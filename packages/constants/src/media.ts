export const MEDIA_SORTABLE_FIELDS = [
  "createdAt",
  "filename",
  "fileSize",
] as const;
export type MediaSortableField = (typeof MEDIA_SORTABLE_FIELDS)[number];

export const MEDIA_SORT_OPTIONS: {
  value: MediaSortableField;
  i18nKey: string;
}[] = [
  { value: "createdAt", i18nKey: "sorting.createdAt" },
  { value: "filename", i18nKey: "sorting.filename" },
  { value: "fileSize", i18nKey: "sorting.fileSize" },
];

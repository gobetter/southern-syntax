"use client";

import { useTranslations } from "next-intl";

import type { SortOrder } from "@southern-syntax/types";

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@southern-syntax/ui";

export interface SortOption<T extends string> {
  value: T;
  label: string;
}

interface SortDropdownProps<T extends string> {
  sortBy: T;
  sortOrder: SortOrder;
  onUpdateQueryAction: (
    updates: Record<string, string | number | null>
  ) => void;
  sortOptions: SortOption<T>[]; // รับ Array ของ object ที่จะใช้สร้างเมนู
}

export default function SortDropdown<T extends string>({
  sortBy,
  sortOrder,
  onUpdateQueryAction,
  sortOptions,
}: SortDropdownProps<T>) {
  const t = useTranslations("admin_media.sorting");

  // หา label ของ field ที่ถูกเลือกอยู่เพื่อนำมาแสดง
  const currentSortLabel =
    sortOptions.find((opt) => opt.value === sortBy)?.label ?? sortBy;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          {t("sort_by")}: {currentSortLabel} ({t(sortOrder)})
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {sortOptions.map(
          (
            option // วนลูปจาก `sortOptions` ที่ได้รับมา
          ) => (
            <DropdownMenuItem
              key={option.value}
              onClick={() =>
                onUpdateQueryAction({
                  sortBy: option.value,
                  sortOrder:
                    sortBy === option.value && sortOrder === "desc"
                      ? "asc"
                      : "desc",
                  page: 1,
                })
              }
            >
              {option.label}
            </DropdownMenuItem>
          )
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

"use client";

import { useLocale, useTranslations } from "next-intl";
import { Search } from "lucide-react";

import {
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@southern-syntax/ui";
import type { MediaCategory, MediaTag } from "@southern-syntax/types";
import { getLocalizedString } from "@southern-syntax/i18n";

export interface FiltersProps {
  search: {
    value: string;
    onChange: (v: string) => void;
    inputRef: React.RefObject<HTMLInputElement | null>;
  };
  categoryId: string | undefined;
  tagId: string | undefined;
  categoryOptions: MediaCategory[];
  tagOptions: MediaTag[];
  onUpdateQueryAction: (
    updates: Record<string, string | number | null>
  ) => void;
}

export default function Filters({
  search,
  categoryId,
  tagId,
  categoryOptions,
  tagOptions,
  onUpdateQueryAction,
}: FiltersProps) {
  const t = useTranslations("admin_media");
  const locale = useLocale();

  return (
    <>
      {/* Category Filter */}
      <Select
        value={categoryId || "all"}
        onValueChange={(val) =>
          onUpdateQueryAction({
            categoryId: val === "all" ? null : val,
            page: 1,
          })
        }
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder={t("filter.category_placeholder")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("filter.all_categories")}</SelectItem>
          {categoryOptions.map((cat) => (
            <SelectItem key={cat.id} value={cat.id}>
              {getLocalizedString(cat.name, locale) || cat.id}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Tag Filter */}
      <Select
        value={tagId || "all"}
        onValueChange={(val) =>
          onUpdateQueryAction({ tagId: val === "all" ? null : val, page: 1 })
        }
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder={t("filter.tag_placeholder")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("filter.all_tags")}</SelectItem>
          {tagOptions.map((tag) => (
            <SelectItem key={tag.id} value={tag.id}>
              {getLocalizedString(tag.name, locale)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Search Input */}
      <div className="relative">
        <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <Input
          ref={search.inputRef}
          placeholder={t("search_placeholder")}
          value={search.value}
          onChange={(e) => search.onChange(e.target.value)} // อัปเดต inputValue
          className="pl-10"
        />
      </div>
    </>
  );
}

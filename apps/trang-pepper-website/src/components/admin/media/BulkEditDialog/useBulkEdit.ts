import { useState, useEffect, useMemo } from "react";
import { useLocale } from "next-intl";

import { mapToSelectOptions } from "@southern-syntax/utils";
import type { LocalizedString } from "@southern-syntax/types";

import type { MediaItem } from "@/types/trpc";
import { trpc } from "@/lib/trpc-client";

import {
  getInitialCheckboxStates,
  toggleCheckboxState,
  getChangedCheckboxIdsSafe,
  type CheckboxStates,
} from "./helpers/checkboxUtils";

interface UseBulkEditProps {
  mediaItems: MediaItem[];
  mediaIds: string[];
  isOpen: boolean;
  onSuccess: () => void;
  onClose: () => void;
}

export function useBulkEdit({
  mediaItems,
  mediaIds,
  isOpen,
  onSuccess,
  onClose,
}: UseBulkEditProps) {
  const locale = useLocale();
  const utils = trpc.useUtils();

  // --- State Management ---
  const [categoryStates, setCategoryStates] = useState<CheckboxStates>({});
  const [tagStates, setTagStates] = useState<CheckboxStates>({});
  const [initialCategoryStates, setInitialCategoryStates] =
    useState<CheckboxStates>({});
  const [initialTagStates, setInitialTagStates] = useState<CheckboxStates>({});

  // --- Data Fetching ---
  const { data: categories } = trpc.mediaCategory.getAll.useQuery();
  const { data: tags } = trpc.mediaTag.getAll.useQuery();

  // --- Data Mutation ---
  const updateCategories = trpc.media.updateCategories.useMutation();
  const updateTags = trpc.media.updateTags.useMutation();

  // --- Effects ---
  useEffect(() => {
    if (isOpen && mediaItems.length > 0) {
      const cats = getInitialCheckboxStates(mediaItems, "categories");
      const tgs = getInitialCheckboxStates(mediaItems, "tags");
      setCategoryStates(cats);
      setInitialCategoryStates(cats);
      setTagStates(tgs);
      setInitialTagStates(tgs);
    }
  }, [isOpen, mediaItems]);

  // --- Event Handlers ---
  const handleSave = async () => {
    const { toAdd: addCats, toRemove: removeCats } = getChangedCheckboxIdsSafe(
      initialCategoryStates,
      categoryStates
    );
    const { toAdd: addTags, toRemove: removeTags } = getChangedCheckboxIdsSafe(
      initialTagStates,
      tagStates
    );

    const promises: Promise<unknown>[] = [];

    if (addCats.length || removeCats.length) {
      promises.push(
        updateCategories.mutateAsync({
          mediaIds,
          addIds: addCats,
          removeIds: removeCats,
        })
      );
    }
    if (addTags.length || removeTags.length) {
      promises.push(
        updateTags.mutateAsync({
          mediaIds,
          addIds: addTags,
          removeIds: removeTags,
        })
      );
    }

    if (promises.length > 0) {
      await Promise.all(promises);
      utils.media.getAll.invalidate(); // Invalidate หนึ่งครั้งหลังทุกอย่างเสร็จ
      onSuccess();
    }

    onClose();
  };

  const handleCategoryChange = (id: string) => {
    setCategoryStates((prev) => toggleCheckboxState(prev, id));
  };

  const handleTagChange = (id: string) => {
    setTagStates((prev) => toggleCheckboxState(prev, id));
  };

  // --- Derived State ---
  const isMutating = updateCategories.isPending || updateTags.isPending;

  const categoryOptions = useMemo(
    () =>
      mapToSelectOptions(
        categories as
          | Array<{ id: string; name: LocalizedString; slug: string }>
          | undefined,
        locale,
        (c) => c.name,
        (c) => c.slug
      ),
    [categories, locale]
  );

  const tagOptions = useMemo(
    () =>
      mapToSelectOptions(
        tags as
          | Array<{ id: string; name: LocalizedString; slug: string }>
          | undefined,
        locale,
        (t) => t.name,
        (t) => t.slug
      ),
    [tags, locale]
  );

  // --- Return all values needed by the component ---
  return {
    isMutating,
    categoryOptions,
    tagOptions,
    categoryStates,
    tagStates,
    handleSave,
    handleCategoryChange,
    handleTagChange,
  };
}

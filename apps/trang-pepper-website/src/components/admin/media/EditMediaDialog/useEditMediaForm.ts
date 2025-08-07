// src/components/admin/media/EditMediaDialog/useEditMediaForm.ts
import { useEffect, useMemo } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import { trpc } from "@/lib/trpc-client";
import {
  mediaUpdateFormInputSchema,
  type MediaUpdateFormInput,
} from "@southern-syntax/schemas/media";
import type { TRPCClientErrorLike } from "@trpc/client";
import type { AppRouter } from "@/server/routers/_app";
import { useToast } from "@southern-syntax/hooks";
import type { MediaItem } from "@/types/trpc";
import type { LocalizedString } from "@southern-syntax/types";
import { mapToSelectOptions } from "@southern-syntax/utils";
import { mediaToFormValues } from "./mediaToFormValues";

interface UseEditMediaFormProps {
  media: MediaItem | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function useEditMediaForm({
  media,
  onOpenChange,
}: UseEditMediaFormProps) {
  const t_success = useTranslations("admin_media.success_messages");
  const locale = useLocale();
  const utils = trpc.useUtils();
  const toast = useToast();

  // --- Data Fetching ---
  const { data: categories } = trpc.mediaCategory.getAll.useQuery();
  const { data: tags } = trpc.mediaTag.getAll.useQuery();

  // --- Form Management ---
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { isSubmitting },
  } = useForm<MediaUpdateFormInput>({
    resolver: zodResolver(mediaUpdateFormInputSchema),
  });

  // --- Effects ---
  useEffect(() => {
    if (media) {
      reset(mediaToFormValues(media));
    }
  }, [media, reset]);

  // --- Mutation ---
  const updateMediaMutation = trpc.media.update.useMutation({
    onSuccess: () => {
      toast.success(t_success("update_success"));
      utils.media.getAll.invalidate();
      onOpenChange(false);
    },
    onError: (error: TRPCClientErrorLike<AppRouter>) => {
      toast.error(error.message);
    },
  });

  // --- Event Handlers ---
  const onSubmit: SubmitHandler<MediaUpdateFormInput> = (data) => {
    if (!media) return;
    updateMediaMutation.mutate({ id: media.id, data });
  };

  // --- Derived State (Memoized) ---
  const categoryOptions = useMemo(
    () =>
      mapToSelectOptions(
        categories as
          | Array<{ id: string; name: LocalizedString; slug: string }>
          | undefined,
        locale,
        (cat) => cat.name,
        (cat) => cat.slug
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
        (tag) => tag.name,
        (tag) => tag.slug
      ),
    [tags, locale]
  );

  /*
  const categoryOptions = useMemo(
    () =>
      mapToSelectOptions(
        categories as { name: LocalizedString; id: string; slug: string }[] | undefined,
        locale,
        (c) => c.name,
        (c) => c.slug,
      ),
    [categories, locale],
  );

  const tagOptions = useMemo(
    () =>
      mapToSelectOptions(
        tags as { name: LocalizedString; id: string; slug: string }[] | undefined,
        locale,
        (t) => t.name,
        (t) => t.slug,
      ),
    [tags, locale],
  );
  */

  /*
  const categoryOptions = useMemo(() => {
    return (
      (categories as { name: LocalizedString; id: string; slug: string }[] | undefined)?.map(
        (cat) => ({
          id: cat.id,
          label: getLocalizedString(cat.name, locale) || cat.slug,
        }),
      ) ?? []
    );
  }, [categories, locale]);

  const tagOptions = useMemo(() => {
    return (
      (tags as { name: LocalizedString; id: string; slug: string }[] | undefined)?.map((tag) => ({
        id: tag.id,
        label: getLocalizedString(tag.name, locale) || tag.slug,
      })) ?? []
    );
  }, [tags, locale]);
  */

  return {
    register,
    handleSubmit,
    control,
    isSubmitting: isSubmitting || updateMediaMutation.isPending,
    onSubmit,
    categoryOptions,
    tagOptions,
  };
}

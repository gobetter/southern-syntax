import { useEffect, useMemo } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";

import { trpc } from "@/lib/trpc-client";
import type { TRPCClientErrorLike } from "@trpc/client";
import type { AppRouter } from "@/server/routers/_app";
// import type { MediaItem } from "@southern-syntax/types";
import { MediaItem } from "@/types/trpc";

import {
  mediaUpdateFormInputSchema,
  type MediaUpdateFormInput,
} from "@southern-syntax/schemas/media";
import type { LocalizedString } from "@southern-syntax/types";
import { mapToSelectOptions } from "@southern-syntax/utils";
import { useToast } from "@southern-syntax/hooks";

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

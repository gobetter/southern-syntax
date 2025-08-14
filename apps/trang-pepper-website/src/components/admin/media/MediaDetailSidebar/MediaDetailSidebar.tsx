"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";

import { getLocalizedString } from "@southern-syntax/i18n";

// import type { MediaItem } from "@southern-syntax/types";
import type { MediaItem } from "@/types/trpc";

import {
  Button,
  Separator,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@southern-syntax/ui";

import InformationSection from "./_components/InformationSection";
import TaxonomySection from "./_components/TaxonomySection";
import UrlsSection from "./_components/UrlsSection";

interface MediaDetailSidebarProps {
  media: MediaItem | null;
  onOpenChangeAction: (open: boolean) => void;
  onEditAction: () => void;
}

export default function MediaDetailSidebar({
  media,
  onOpenChangeAction,
  onEditAction,
}: MediaDetailSidebarProps) {
  const t = useTranslations("admin_media.details");
  const common_t = useTranslations("common");
  const locale = useLocale();

  if (!media) return null;

  const thumbnail = media.variants?.["original"] || media.originalUrl;

  return (
    <Sheet open={!!media} onOpenChange={onOpenChangeAction}>
      <SheetContent className="flex w-full flex-col p-6 sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>
            {getLocalizedString(media.title, locale) || media.filename}
          </SheetTitle>
          <SheetDescription className="truncate">
            {media.filename}
          </SheetDescription>
        </SheetHeader>

        <div className="-mr-6 flex-1 overflow-y-auto px-6">
          <div className="relative mt-4 aspect-video w-full">
            <Image
              src={thumbnail}
              alt={getLocalizedString(media.altText, locale) || media.filename}
              fill
              className="rounded-md object-contain"
              unoptimized
            />
          </div>

          <div className="mt-6 space-y-6 pb-6 text-sm">
            <InformationSection media={media} />
            <TaxonomySection media={media} />
            <UrlsSection media={media} />
          </div>

          <Separator />
        </div>

        <SheetFooter className="mt-auto border-t pt-6">
          <Button
            type="button"
            variant="secondary"
            className="w-full"
            onClick={onEditAction}
          >
            {t("edit_button")}
          </Button>

          <SheetClose asChild>
            <Button type="button" className="w-full">
              {common_t("general.close")}
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

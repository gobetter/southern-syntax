"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
// import type { MediaItem } from "@southern-syntax/types";
import type { MediaItem } from "@/types/trpc";

import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@southern-syntax/ui";

interface ImagePreviewDialogProps {
  media: MediaItem | null;
  isOpen: boolean;
  onOpenChangeAction: (open: boolean) => void;
}

export default function ImagePreviewDialog({
  media,
  isOpen,
  onOpenChangeAction,
}: ImagePreviewDialogProps) {
  const t = useTranslations("admin_media.preview_dialog");

  if (!media) {
    return null;
  }

  const previewUrl = media.variants?.["medium"] || media.originalUrl;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChangeAction}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
        </DialogHeader>
        {/* <div className="relative aspect-video w-full"> */}
        <div className="relative w-full" style={{ height: "75vh" }}>
          <Image
            src={previewUrl}
            alt={media.filename}
            fill
            className="object-contain"
            sizes="(max-width: 1024px) 90vw, 80vw" //  ให้คำแนะนำขนาดรูปภาพกับ Next.js
            unoptimized
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChangeAction(false)}>
            {t("close_button")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

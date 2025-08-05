// src/app/[lang]/admin/media-taxonomy/_components/TagManager.tsx
"use client";

import { useTranslations, useLocale } from "next-intl";
import { type UseFormReturn } from "react-hook-form";
import { Edit, Trash2 } from "lucide-react";

import { useTagManager } from "@/hooks/useTagManager";
import { getLocalizedString } from "@/i18n/utils";
import { type MediaTagInput } from "@/schemas/media-taxonomy";

import Spinner from "@/components/common/Spinner";
import { Button } from "@southern-syntax/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@southern-syntax/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@southern-syntax/ui/alert-dialog";

import { TagFormDialog } from "./TagFormDialog";

interface TagManagerProps {
  manager: ReturnType<typeof useTagManager>;
  formMethods: UseFormReturn<MediaTagInput>;
}

export function TagManager({ manager, formMethods }: TagManagerProps) {
  const t = useTranslations("admin_media_taxonomy");
  const locale = useLocale();

  const {
    tags,
    isLoading,
    isMutating,
    isDeleting,
    isDialogOpen,
    editingTag,
    deletingTag,
    onSubmit,
    handleEdit,
    handleDeleteRequest,
    handleDeleteConfirm,
    setDialogOpen,
    setDeletingTag,
  } = manager;

  if (isLoading) {
    return (
      <div className="flex h-48 w-full items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("table.name")}</TableHead>
              <TableHead>{t("table.slug")}</TableHead>
              <TableHead className="text-right">{t("table.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tags?.map((tag) => (
              <TableRow key={tag.id}>
                {/* แก้ไข Fallback เป็น slug */}
                <TableCell>
                  {getLocalizedString(tag.name, locale) || tag.slug}
                </TableCell>
                <TableCell>{tag.slug}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(tag)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-500"
                    onClick={() => handleDeleteRequest(tag)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Edit/Add Dialog */}
      <TagFormDialog
        isOpen={isDialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={onSubmit}
        isEditing={!!editingTag?.id}
        isMutating={isMutating}
        formMethods={formMethods}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deletingTag}
        onOpenChange={() => setDeletingTag(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("dialog_shared.delete_confirm_title")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("tags.delete_confirm_text")}
              <strong>
                {deletingTag
                  ? getLocalizedString(deletingTag.name, locale)
                  : ""}
              </strong>
              ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("dialog_shared.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting
                ? t("dialog_shared.deleting_button")
                : t("dialog_shared.delete_button")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

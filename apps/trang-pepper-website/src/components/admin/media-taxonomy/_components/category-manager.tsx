"use client";

import { useTranslations, useLocale } from "next-intl";
import { type UseFormReturn } from "react-hook-form";
import { Edit, Trash2 } from "lucide-react";

import { getLocalizedString } from "@southern-syntax/i18n";
import { type MediaCategoryInput } from "@southern-syntax/schemas/media-taxonomy";

import { Button } from "@southern-syntax/ui";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@southern-syntax/ui";

import type { useCategoryManager } from "@/hooks/use-category-manager";
import Spinner from "@/components/common/spinner";

import { CategoryFormDialog } from "./category-form-dialog";

interface CategoryManagerProps {
  manager: ReturnType<typeof useCategoryManager>;
  formMethods: UseFormReturn<MediaCategoryInput>;
}

export function CategoryManager({
  manager,
  formMethods,
}: CategoryManagerProps) {
  const t = useTranslations("admin_media_taxonomy");
  const locale = useLocale();

  const {
    categories,
    isLoading,
    isMutating,
    isDeleting,
    isDialogOpen,
    editingCategory,
    deletingCategory,
    onSubmit,
    handleEdit,
    handleDeleteRequest,
    handleDeleteConfirm,
    setDialogOpen,
    setDeletingCategory,
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
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>{t("table.name")}</TableHead>
              <TableHead>{t("table.slug")}</TableHead>
              <TableHead className="text-right">{t("table.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((cat) => (
              <TableRow key={cat.id}>
                <TableCell>
                  {getLocalizedString(cat.name, locale) || cat.slug}
                </TableCell>
                <TableCell>{cat.slug}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(cat)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-500"
                    onClick={() => handleDeleteRequest(cat)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <CategoryFormDialog
        isOpen={isDialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={onSubmit}
        isEditing={!!editingCategory?.id}
        isMutating={isMutating}
        formMethods={formMethods}
      />

      <AlertDialog
        open={!!deletingCategory}
        onOpenChange={() => setDeletingCategory(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("dialog_shared.delete_confirm_title")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("categories.delete_confirm_text")}{" "}
              <strong>
                {deletingCategory
                  ? getLocalizedString(deletingCategory.name, locale)
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
              disabled={isDeleting}
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

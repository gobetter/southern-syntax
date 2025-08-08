"use client";

import { useTranslations } from "next-intl";
import { Edit, Trash2 } from "lucide-react";

import { Button } from "@southern-syntax/ui";

interface MediaActionBarProps {
  selectedCount: number;
  onDeleteRequestAction: () => void;
  onClearSelectionAction: () => void;
  onEditSelectedAction: () => void;
  isDeleting: boolean;
}

export default function MediaActionBar({
  selectedCount,
  onDeleteRequestAction,
  onClearSelectionAction,
  onEditSelectedAction,
  isDeleting,
}: MediaActionBarProps) {
  const t = useTranslations("admin_media.action_bar");

  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-y-2 rounded-md border bg-gray-100 p-3 dark:bg-gray-800">
      <div className="flex items-center gap-4">
        <p className="text-sm font-semibold">
          {t("items_selected", { count: selectedCount })}
        </p>
        <Button variant="outline" size="sm" onClick={onClearSelectionAction}>
          {t("clear_selection")}
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onEditSelectedAction}>
          <Edit className="mr-2 h-4 w-4" />
          {t("edit_selected")}
        </Button>

        {/* ปุ่มนี้จะถูก disable ขณะกำลังลบ และจะเรียก onDeleteRequest เมื่อคลิก */}
        <Button
          variant="destructive"
          size="sm"
          onClick={onDeleteRequestAction}
          disabled={isDeleting}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          {isDeleting ? t("delete_dialog.deleting") : t("delete_selected")}
        </Button>
      </div>
    </div>
  );
}

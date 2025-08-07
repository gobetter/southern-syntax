"use client";

import { Edit, MoreVertical, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@southern-syntax/ui";

export default function MediaDropdown({
  onEdit,
  onDelete,
}: {
  onEdit: () => void;
  onDelete: () => void;
}) {
  const t_dropdown = useTranslations("admin_media.dropdown");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary" size="icon" className="h-7 w-7">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={onEdit}>
          <Edit className="mr-2 h-4 w-4" />
          {t_dropdown("edit_details")}
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-red-600 focus:text-red-600"
          onSelect={() => {
            // e.preventDefault();
            onDelete();
          }}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          {t_dropdown("delete")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

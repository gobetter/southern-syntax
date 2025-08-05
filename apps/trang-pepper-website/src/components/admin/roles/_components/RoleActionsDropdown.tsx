// src/components/admin/roles/_components/RoleActionsDropdown.tsx
"use client";

import { Edit, MoreVertical, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@southern-syntax/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@southern-syntax/ui/dropdown-menu";

interface RoleActionsDropdownProps {
  onEdit: () => void;
  onDelete: () => void;
  isSystemRole: boolean; // รับค่าเพื่อเช็คว่าเป็น Role ของระบบหรือไม่
}

export default function RoleActionsDropdown({
  onEdit,
  onDelete,
  isSystemRole,
}: RoleActionsDropdownProps) {
  const t = useTranslations("common.actions");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {/* <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreVertical className="h-4 w-4" />
        </Button> */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          disabled={isSystemRole}
        >
          {/*  Disable ปุ่มเมนูทั้งหมดถ้าเป็น System Role */}
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={onEdit}>
          <Edit className="mr-2 h-4 w-4" />
          <span>{t("edit")}</span>
        </DropdownMenuItem>

        {/* ปุ่มลบจะถูก disable ถ้าเป็น isSystemRole */}
        <DropdownMenuItem
          className="text-red-600 focus:text-red-600"
          onSelect={onDelete}
          disabled={isSystemRole}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          <span>{t("delete")}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

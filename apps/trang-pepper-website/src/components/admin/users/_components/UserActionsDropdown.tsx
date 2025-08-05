// src/components/admin/users/_components/UserActionsDropdown.tsx
"use client";

import { Edit, MoreVertical, Trash2, CheckCircle2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@southern-syntax/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@southern-syntax/ui/dropdown-menu";

interface UserActionsDropdownProps {
  onEdit: () => void;
  onDelete: () => void;
  onActivate: () => void;
  canDelete?: boolean;
  isActive: boolean;
}

export default function UserActionsDropdown({
  onEdit,
  onDelete,
  onActivate,
  canDelete = true,
  isActive,
}: UserActionsDropdownProps) {
  const t = useTranslations("common.actions");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        {/* แสดงเมนู "แก้ไข" เสมอ */}
        <DropdownMenuItem onSelect={onEdit}>
          <Edit className="mr-2 h-4 w-4" />
          <span>{t("edit")}</span>
        </DropdownMenuItem>

        {/* แสดงเมนู "ปิดการใช้งาน" ก็ต่อเมื่อ canDelete และ isActive เป็น true */}
        {canDelete && isActive && (
          <DropdownMenuItem
            className="text-red-600 focus:text-red-600"
            onSelect={onDelete}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            <span>{t("deactivate")}</span>
          </DropdownMenuItem>
        )}

        {/* แสดงเมนู "เปิดการใช้งาน" ก็ต่อเมื่อผู้ใช้ Inactive */}
        {!isActive && (
          <DropdownMenuItem
            className="text-green-600 focus:text-green-600"
            onSelect={onActivate}
          >
            <CheckCircle2 className="mr-2 h-4 w-4" />
            <span>{t("activate")}</span>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

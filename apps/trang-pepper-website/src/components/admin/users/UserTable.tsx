// src/components/admin/users/UserTable.tsx
"use client";

import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { ArrowUpDown, ChevronDown, ChevronUp } from "lucide-react";

import { getLocalizedString } from "@southern-syntax/i18n";
import { UserItem } from "@/types/trpc";
import type { UserSortableField } from "@southern-syntax/types";

import { Button } from "@southern-syntax/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Checkbox,
} from "@southern-syntax/ui";

import UserActionsDropdown from "./_components/UserActionsDropdown";

interface UserTableProps {
  users: UserItem[];
  selectedIds: Set<string>;
  currentUserId?: string;
  areAllSelectableSelected: boolean;
  onToggleSelectAll: () => void;
  onToggleSelectRow: (id: string, checked: boolean) => void;
  onEditUser: (user: UserItem) => void;
  onDeleteUser: (user: UserItem) => void;
  onActivateUser: (user: UserItem) => void;
  sortBy: UserSortableField | null;
  sortOrder: string | null;
  onSort: (field: UserSortableField) => void;
}

export default function UserTable({
  users,
  selectedIds,
  currentUserId,
  areAllSelectableSelected,
  onToggleSelectAll,
  onToggleSelectRow,
  onEditUser,
  onDeleteUser,
  onActivateUser,
  sortBy,
  sortOrder,
  onSort,
}: UserTableProps) {
  const t = useTranslations("admin_users");
  const tCommon = useTranslations("common");
  const locale = useLocale(); // เรียกใช้ hook เพื่อเอาภาษาปัจจุบัน

  const renderSortArrow = (field: UserSortableField) => {
    if (sortBy !== field)
      return <ArrowUpDown className="text-muted-foreground ml-2 h-4 w-4" />;
    if (sortOrder === "desc") return <ChevronDown className="ml-2 h-4 w-4" />;
    return <ChevronUp className="ml-2 h-4 w-4" />;
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">
              <Checkbox
                checked={areAllSelectableSelected}
                onCheckedChange={onToggleSelectAll}
              />
            </TableHead>
            <TableHead>
              <Button variant="ghost" onClick={() => onSort("name")}>
                {t("table.header_name")}
                {renderSortArrow("name")}
              </Button>
            </TableHead>
            <TableHead>
              <Button variant="ghost" onClick={() => onSort("email")}>
                {t("table.header_email")}
                {renderSortArrow("email")}
              </Button>
            </TableHead>
            <TableHead>
              <Button variant="ghost" onClick={() => onSort("role")}>
                {t("table.header_role")}
                {renderSortArrow("role")}
              </Button>
            </TableHead>

            {/* ทำให้หัวตาราง Status คลิกได้ */}
            <TableHead>
              <Button variant="ghost" onClick={() => onSort("isActive")}>
                {t("table.header_status")}
                {renderSortArrow("isActive")}
              </Button>
            </TableHead>
            <TableHead className="text-right">
              {t("table.header_actions")}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow
              key={user.id}
              data-state={selectedIds.has(user.id) && "selected"}
              className="hover:bg-muted/50 cursor-pointer"
            >
              <TableCell>
                <Checkbox
                  checked={selectedIds.has(user.id)}
                  onCheckedChange={(checked) =>
                    onToggleSelectRow(user.id, !!checked)
                  }
                  disabled={user.id === currentUserId}
                />
              </TableCell>
              <TableCell className="font-medium">
                {getLocalizedString(user.name, locale) || user.email}
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                {getLocalizedString(user.role?.name, locale) ||
                  tCommon("general.not_available")}
              </TableCell>
              <TableCell>
                <span
                  className={`rounded-full px-2 py-1 text-xs ${
                    user.isActive
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                  }`}
                >
                  {user.isActive
                    ? tCommon("status.values.active")
                    : tCommon("status.values.inactive")}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <UserActionsDropdown
                  onEdit={() => onEditUser(user)}
                  onDelete={() => onDeleteUser(user)}
                  onActivate={() => onActivateUser(user)}
                  canDelete={user.id !== currentUserId}
                  isActive={user.isActive}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

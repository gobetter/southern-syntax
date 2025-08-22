"use client";

import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { ArrowUpDown, ChevronDown, ChevronUp } from "lucide-react";

import { getLocalizedString } from "@southern-syntax/i18n";
import type { UserSortableField } from "@southern-syntax/types";
import { Button } from "@southern-syntax/ui";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Checkbox,
} from "@southern-syntax/ui";

import type { UserItem } from "@southern-syntax/types";

import UserActionsDropdown from "./_components/user-actions-dropdown";

interface UserTableProps {
  users: UserItem[];
  selectedIds: Set<string>;
  currentUserId?: string;
  areAllSelectableSelected: boolean;
  onToggleSelectAllAction: () => void;
  onToggleSelectRowAction: (id: string, checked: boolean) => void;
  onEditUserAction: (user: UserItem) => void;
  onDeleteUserAction: (user: UserItem) => void;
  onActivateUserAction: (user: UserItem) => void;
  sortBy: UserSortableField | null;
  sortOrder: string | null;
  onSortAction: (field: UserSortableField) => void;
}

export default function UserTable({
  users,
  selectedIds,
  currentUserId,
  areAllSelectableSelected,
  onToggleSelectAllAction,
  onToggleSelectRowAction,
  onEditUserAction,
  onDeleteUserAction,
  onActivateUserAction,
  sortBy,
  sortOrder,
  onSortAction,
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
                onCheckedChange={onToggleSelectAllAction}
              />
            </TableHead>
            <TableHead>
              <Button variant="ghost" onClick={() => onSortAction("name")}>
                {t("table.header_name")}
                {renderSortArrow("name")}
              </Button>
            </TableHead>
            <TableHead>
              <Button variant="ghost" onClick={() => onSortAction("email")}>
                {t("table.header_email")}
                {renderSortArrow("email")}
              </Button>
            </TableHead>
            <TableHead>
              <Button variant="ghost" onClick={() => onSortAction("role")}>
                {t("table.header_role")}
                {renderSortArrow("role")}
              </Button>
            </TableHead>

            {/* ทำให้หัวตาราง Status คลิกได้ */}
            <TableHead>
              <Button variant="ghost" onClick={() => onSortAction("isActive")}>
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
                    onToggleSelectRowAction(user.id, !!checked)
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
                  onEdit={() => onEditUserAction(user)}
                  onDelete={() => onDeleteUserAction(user)}
                  onActivate={() => onActivateUserAction(user)}
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

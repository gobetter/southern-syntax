"use client";

import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Trash2, X, CheckCircle2, MoreVertical } from "lucide-react";

import { trpc } from "@/lib/trpc-client";
import { mapToSelectOptions } from "@southern-syntax/utils";

import { Button } from "@southern-syntax/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@southern-syntax/ui";
import { LocalizedString } from "@southern-syntax/types";

interface UserActionBarProps {
  selectedCount: number;
  onDeactivateSelected: () => void;
  onReactivateSelected: () => void;
  onChangeRoleSelected: (roleId: string) => void;
  onClearSelection: () => void;
  isDeactivating: boolean;
  isReactivating: boolean;
  isChangingRole: boolean;
  canDeactivate: boolean;
  canReactivate: boolean;
}

export default function UserActionBar({
  selectedCount,
  onDeactivateSelected,
  onReactivateSelected,
  onChangeRoleSelected,
  onClearSelection,
  isDeactivating,
  isReactivating,
  isChangingRole,
  canDeactivate,
  canReactivate,
}: UserActionBarProps) {
  const t = useTranslations("admin_users.action_bar");
  const locale = useLocale();
  // const { data: roles } = trpc.role.getAll.useQuery(); // ดึงข้อมูล Role มาใช้
  const { data: roles } = trpc.role.getForSelection.useQuery();

  const roleOptions = useMemo(
    () =>
      mapToSelectOptions(
        roles as
          | { id: string; name: LocalizedString; key: string }[]
          | undefined,
        locale,
        (r) => r.name,
        (r) => r.key
      ),
    [roles, locale]
  );

  const isAnyActionProcessing =
    isDeactivating || isReactivating || isChangingRole;

  return (
    <div className="mb-4 flex h-14 items-center justify-between rounded-md border bg-gray-100 p-3 dark:bg-gray-800">
      <div className="flex items-center gap-2">
        <p className="text-sm font-semibold">
          {t("items_selected", { count: selectedCount })}
        </p>
        <Select
          onValueChange={onChangeRoleSelected}
          disabled={isAnyActionProcessing}
        >
          <SelectTrigger className="h-9 w-[180px]">
            <SelectValue placeholder={t("change_role_placeholder")} />
          </SelectTrigger>
          <SelectContent>
            {roleOptions.map((role) => (
              <SelectItem key={role.id} value={role.id}>
                {role.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              disabled={isAnyActionProcessing}
            >
              {t("actions_button")}
              <MoreVertical className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {canReactivate && (
              <DropdownMenuItem
                onSelect={onReactivateSelected}
                disabled={isReactivating}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                <span>
                  {isReactivating
                    ? t("reactivating_button")
                    : t("reactivate_selected")}
                </span>
              </DropdownMenuItem>
            )}
            {canDeactivate && (
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onSelect={onDeactivateSelected}
                disabled={isDeactivating}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                <span>
                  {isDeactivating
                    ? t("deactivating_button")
                    : t("deactivate_selected")}
                </span>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="ghost"
          size="icon"
          onClick={onClearSelection}
          className="h-8 w-8"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

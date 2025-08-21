"use client";

import { useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import { trpc } from "@/lib/trpc-client";

import { useUpdateQuery } from "@southern-syntax/hooks-next";
import { mapToSelectOptions } from "@southern-syntax/utils";
import type { LocalizedString } from "@southern-syntax/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@southern-syntax/ui";

interface UserRoleFilterProps {
  currentRoleId?: string | null;
}

export default function UserRoleFilter({ currentRoleId }: UserRoleFilterProps) {
  const t = useTranslations("admin_users");
  const locale = useLocale();
  const updateQuery = useUpdateQuery();

  // ดึงข้อมูล Role ทั้งหมดมาเพื่อสร้างเป็นตัวเลือก
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

  const handleRoleChange = (roleId: string) => {
    updateQuery({ roleId: roleId === "all" ? null : roleId, page: 1 });
  };

  return (
    <Select value={currentRoleId ?? "all"} onValueChange={handleRoleChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder={t("role_filter_placeholder")} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{t("all_roles")}</SelectItem>
        {roleOptions.map((role) => (
          <SelectItem key={role.id} value={role.id}>
            {role.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

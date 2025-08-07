"use client";

import { useTranslations, useLocale } from "next-intl";
import { useSession } from "next-auth/react";

import { getLocalizedString } from "@southern-syntax/i18n";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@southern-syntax/ui";
import { ROLE_NAMES } from "@southern-syntax/auth";

import type { Role } from "@/types/role";

import RoleActionsDropdown from "./_components/RoleActionsDropdown";

interface RoleTableProps {
  roles: Role[];
  onEdit: (role: Role) => void;
  onDelete: (role: Role) => void;
}

export default function RoleTable({ roles, onEdit, onDelete }: RoleTableProps) {
  const t = useTranslations("admin_rbac.table");
  const locale = useLocale();
  const { data: session } = useSession();

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead>{t("header_key")}</TableHead>
            <TableHead>{t("header_name")}</TableHead>
            <TableHead>{t("header_users")}</TableHead>
            <TableHead>{t("header_permissions")}</TableHead>
            <TableHead className="text-right">{t("header_actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {roles.map((role) => (
            <TableRow key={role.id}>
              <TableCell className="font-mono text-xs">{role.key}</TableCell>
              <TableCell className="font-medium">
                {getLocalizedString(role.name, locale) || role.key}
              </TableCell>
              <TableCell>{role._count.users}</TableCell>
              <TableCell>{role._count.permissions}</TableCell>
              <TableCell className="text-right">
                <RoleActionsDropdown
                  onEdit={() => onEdit(role)}
                  onDelete={() => onDelete(role)}
                  // เพิ่มเงื่อนไขการตรวจสอบ
                  //    - ปุ่มจะ disable ก็ต่อเมื่อ:
                  //    - 1. Role นั้นเป็น isSystem และ
                  //    - 2. ผู้ใช้ที่ล็อกอินอยู่ "ไม่ใช่" SUPERADMIN
                  isSystemRole={
                    role.isSystem &&
                    session?.user?.role !== ROLE_NAMES.SUPERADMIN
                  }
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

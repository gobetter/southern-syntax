// src/components/admin/users/UserStatusTabs.tsx
"use client";

import { useTranslations } from "next-intl";

import { type UserStatusView, USER_STATUS_VIEWS } from "@/types/user";
import { Tabs, TabsList, TabsTrigger } from "@southern-syntax/ui/tabs";

interface UserStatusTabsProps {
  currentStatus: UserStatusView;
  onStatusChange: (status: string) => void;
}

export default function UserStatusTabs({
  currentStatus,
  onStatusChange,
}: UserStatusTabsProps) {
  const t = useTranslations("admin_users.status_tabs");

  return (
    <Tabs defaultValue={currentStatus} onValueChange={onStatusChange}>
      <TabsList>
        {/* ใช้ .map() เพื่อสร้าง Tabs ทั้งหมดโดยอัตโนมัติ */}
        {USER_STATUS_VIEWS.map((status) => (
          <TabsTrigger key={status} value={status}>
            {t(status)}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}

"use client";

import { useTranslations, useLocale } from "next-intl";

import { getLocalizedString } from "@southern-syntax/i18n";

import { Card, CardHeader, CardTitle, CardContent } from "@southern-syntax/ui";

interface UserInfoProps {
  user: {
    // name?: { [key: string]: string } | null;
    name?: { [key: string]: string } | string | null;
    email?: string | null;
    role?: string | null;
  };
}

export default function UserInfo({ user }: UserInfoProps) {
  const t_common = useTranslations("common");
  const locale = useLocale();

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>{t_common("user_info.title")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1 text-sm">
        <p>
          <strong>{t_common("user_info.name")}:</strong>
          {getLocalizedString(user.name, locale) || "-"}
        </p>
        <p>
          <strong>{t_common("user_info.email")}:</strong> {user.email}
        </p>
        <p>
          <strong>{t_common("user_info.role")}:</strong> {user.role}
        </p>
      </CardContent>
    </Card>
  );
}

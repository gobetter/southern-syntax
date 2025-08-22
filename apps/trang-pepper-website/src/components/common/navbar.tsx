"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";

import { getLocalizedString } from "@southern-syntax/i18n";
import { Button } from "@southern-syntax/ui";

import ThemeToggle from "./theme-toggle";
import LanguageSwitcher from "./language-switcher";

interface NavbarProps {
  initialTheme: string | null;
}

export default function Navbar({ initialTheme }: NavbarProps) {
  const { data: session } = useSession();
  const locale = useLocale();
  const t_common = useTranslations("common");
  const t_auth = useTranslations("auth");

  // เตรียมชื่อที่จะแสดงผลไว้ล่วงหน้า
  const displayName = session?.user?.name
    ? getLocalizedString(session.user.name, locale) || session.user.email
    : "";

  return (
    <nav className="flex items-center justify-between border-b px-4 py-2">
      <Link href={`/${locale}/`} className="font-semibold">
        Trang Pepper CMS
      </Link>
      <div className="flex items-center gap-2">
        <LanguageSwitcher />
        <ThemeToggle initialTheme={initialTheme} />
        {session ? (
          <>
            <span className="text-sm font-medium">{displayName}</span>
            <Link href={`/${locale}/dashboard`}>
              <Button variant="ghost">
                {t_common("navigation.dashboard")}
              </Button>
            </Link>
            <Button variant="ghost" onClick={() => signOut()}>
              {t_auth("logout.button")}
            </Button>
          </>
        ) : (
          <>
            <Link href={`/${locale}/auth/signin`}>
              <Button variant="ghost">{t_auth("login.button")}</Button>
            </Link>
            <Link href={`/${locale}/auth/register`}>
              <Button variant="ghost">{t_auth("register.button")}</Button>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

"use client";
import { useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";

import {
  Button,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@southern-syntax/ui";

import { locales } from "@southern-syntax/config";

const localeFlagMap: Record<string, string> = {
  en: "🇺🇸",
  th: "🇹🇭",
};

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const changeLanguage = (newLocale: string) => {
    if (!newLocale || newLocale === locale) return;
    const segments = pathname.split("/");
    const filteredSegments = segments.filter((s) => s !== "");
    let newPath = "";
    if (
      filteredSegments.length > 0 &&
      locales.includes(filteredSegments[0] as (typeof locales)[number])
    ) {
      filteredSegments[0] = newLocale;
      newPath = `/${filteredSegments.join("/")}`;
    } else {
      newPath = `/${newLocale}${pathname}`;
    }
    router.push(newPath);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost">
          {localeFlagMap[locale] || locale.toUpperCase()}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((l) => (
          <DropdownMenuItem key={l} onSelect={() => changeLanguage(l)}>
            {localeFlagMap[l] || l.toUpperCase()} {l.toUpperCase()}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

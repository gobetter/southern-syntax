import { headers } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import {
  loadMessages,
  resolveLocale,
  negotiateLocale,
} from "@southern-syntax/i18n";

export default getRequestConfig(async ({ locale }) => {
  const headerList = await headers();
  const acceptLanguage = headerList.get("accept-language");
  const browserPreferredLocale = acceptLanguage
    ? negotiateLocale(acceptLanguage)
    : undefined;

  const targetLocale = resolveLocale(locale ?? browserPreferredLocale);
  const messages = await loadMessages(targetLocale);

  return {
    locale: targetLocale,
    messages,
  };
});

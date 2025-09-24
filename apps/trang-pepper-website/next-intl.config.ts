import { getRequestConfig } from "next-intl/server";
import { loadMessages, resolveLocale } from "@southern-syntax/i18n";

export default getRequestConfig(async ({ locale }) => {
  const targetLocale = resolveLocale(locale);
  const messages = await loadMessages(targetLocale);

  return {
    locale: targetLocale,
    messages,
  };
});

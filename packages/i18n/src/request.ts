import {
  locales as configLocales,
  defaultLocale as configDefaultLocale,
} from "@southern-syntax/config";

export const supportedLocales = [...configLocales];
export type SupportedLocale = (typeof supportedLocales)[number];
export const defaultLocale: SupportedLocale =
  configDefaultLocale as SupportedLocale;

const localeSet = new Set<SupportedLocale>(supportedLocales);

export function isSupportedLocale(locale: unknown): locale is SupportedLocale {
  return typeof locale === "string" && localeSet.has(locale as SupportedLocale);
}

type Messages = typeof import("./messages/en").default;
type MessageModuleSpecifier = `./messages/${SupportedLocale}`;

type MessageLoader = () => Promise<Messages>;

const loaders = new Map<SupportedLocale, MessageLoader>();

supportedLocales.forEach((locale) => {
  loaders.set(locale, async () => {
    try {
      const module = await import(
        `./messages/${locale}` as MessageModuleSpecifier
      );
      return module.default;
    } catch (error) {
      throw Object.assign(
        new Error(`Missing translation bundle for locale "${locale}".`),
        { cause: error }
      );
    }
  });
});

export function getMessageLoader(locale: SupportedLocale): MessageLoader {
  const loader = loaders.get(locale);
  if (!loader) {
    throw new Error(`No message loader registered for locale "${locale}".`);
  }
  return loader;
}

export async function loadMessages(locale: SupportedLocale) {
  return getMessageLoader(locale)();
}

export function resolveLocale(locale: string | null | undefined): SupportedLocale {
  return locale && isSupportedLocale(locale) ? locale : defaultLocale;
}

export async function loadMessagesWithFallback(
  locale: string | null | undefined
) {
  return loadMessages(resolveLocale(locale));
}

// Legacy alias
export const getMessages = loadMessages;

import {
  locales as configLocales,
  defaultLocale as configDefaultLocale,
} from "@southern-syntax/config";
import type { MessageCatalog } from "./messages/en";

export const supportedLocales = [...configLocales];
export type SupportedLocale = (typeof supportedLocales)[number];
export const defaultLocale: SupportedLocale =
  configDefaultLocale as SupportedLocale;

const localeSet = new Set<SupportedLocale>(supportedLocales);

export function isSupportedLocale(locale: unknown): locale is SupportedLocale {
  return typeof locale === "string" && localeSet.has(locale as SupportedLocale);
}

type MessageModuleSpecifier = `./messages/${SupportedLocale}`;

type MessageLoader = () => Promise<MessageCatalog>;

const loaders = new Map<SupportedLocale, MessageLoader>();
const messageCache = new Map<SupportedLocale, Promise<MessageCatalog>>();

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
  let cached = messageCache.get(locale);
  if (!cached) {
    cached = getMessageLoader(locale)();
    messageCache.set(locale, cached);
  }
  return cached;
}

export function clearMessageCache() {
  messageCache.clear();
}

export function resolveLocale(locale: string | null | undefined): SupportedLocale {
  return locale && isSupportedLocale(locale) ? locale : defaultLocale;
}

function parseAcceptLanguage(
  acceptLanguage: string | string[] | null | undefined
) {
  if (!acceptLanguage) return [];

  const value = Array.isArray(acceptLanguage)
    ? acceptLanguage.join(",")
    : acceptLanguage;

  return value
    .split(",")
    .map((part) => {
      const [rawTag, rawQuality = "q=1"] = part.trim().split(";");
      const tag = rawTag?.trim().toLowerCase();
      if (!tag) return null;

      const qualityToken = rawQuality.split("=")[1] ?? "1";
      const quality = Number(qualityToken);

      return {
        tag,
        quality: Number.isFinite(quality) ? quality : 0,
      };
    })
    .filter((entry): entry is { tag: string; quality: number } => Boolean(entry))
    .sort((a, b) => b.quality - a.quality);
}

function matchSupportedLocale(tag: string): SupportedLocale | null {
  const normalized = tag.toLowerCase();
  for (const locale of supportedLocales) {
    if (normalized === locale.toLowerCase()) {
      return locale;
    }
  }

  const base = normalized.split("-")[0];
  if (!base) return null;

  for (const locale of supportedLocales) {
    if (locale.toLowerCase() === base) {
      return locale;
    }
  }

  return null;
}

export function negotiateLocale(
  acceptLanguage: string | string[] | null | undefined
): SupportedLocale {
  const candidates = parseAcceptLanguage(acceptLanguage);

  for (const { tag } of candidates) {
    const match = matchSupportedLocale(tag);
    if (match) {
      return match;
    }
  }

  return defaultLocale;
}

export async function loadMessagesWithFallback(
  locale: string | null | undefined
) {
  return loadMessages(resolveLocale(locale));
}

// Legacy alias
export const getMessages = loadMessages;

export type { MessageCatalog };

import { afterEach, describe, expect, it } from "vitest";

import {
  clearMessageCache,
  defaultLocale,
  loadMessages,
  loadMessagesWithFallback,
  negotiateLocale,
  resolveLocale,
  supportedLocales,
  type SupportedLocale,
} from "../request";

const primaryLocale: SupportedLocale =
  supportedLocales[0] ?? defaultLocale;

describe("i18n request helpers", () => {
  afterEach(() => {
    clearMessageCache();
  });

  it("resolves supported locales directly", () => {
    expect(resolveLocale(primaryLocale)).toBe(primaryLocale);
  });

  it("falls back to the default locale when unsupported", () => {
    expect(resolveLocale("xx")).toBe(defaultLocale);
  });

  it("negotiates locale from accept-language header", () => {
    const negotiated = negotiateLocale("fr-CA,th;q=0.9,en;q=0.7");
    const expected: SupportedLocale = supportedLocales.includes(
      "th" as SupportedLocale
    )
      ? ("th" as SupportedLocale)
      : defaultLocale;
    expect(negotiated).toBe(expected);
  });

  it("caches message promises per locale", () => {
    clearMessageCache();
    const initialPromise = loadMessages(primaryLocale);
    const secondPromise = loadMessages(primaryLocale);

    expect(secondPromise).toBe(initialPromise);

    clearMessageCache();
    const afterClearPromise = loadMessages(primaryLocale);
    expect(afterClearPromise).not.toBe(initialPromise);
  });

  it("provides fallback messages for unknown locales", async () => {
    clearMessageCache();
    const fallbackMessages = await loadMessagesWithFallback("xx");
    const defaultMessages = await loadMessages(defaultLocale);

    expect(fallbackMessages).toBe(defaultMessages);
  });
});

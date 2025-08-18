export type SupportedLocale = "en" | "th";
export const supportedLocales: SupportedLocale[] = ["en", "th"];

export async function loadMessages(locale: SupportedLocale) {
  switch (locale) {
    case "en":
      return (await import("./messages/en")).default;
    case "th":
      return (await import("./messages/th")).default;
    default:
      throw new Error(`Unsupported locale: ${locale as string}`);
  }
}

// เผื่อมีโค้ดฝั่งแอปที่อิงฟังก์ชันเดิม
export const getMessages = loadMessages;

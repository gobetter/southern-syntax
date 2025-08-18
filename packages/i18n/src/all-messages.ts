import en from "./messages/en";
import th from "./messages/th";
export const messages = { en, th } as const;
export type AppLocale = keyof typeof messages;
